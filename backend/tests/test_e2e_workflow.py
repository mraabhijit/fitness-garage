import io
from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.auth import AuthenticatedUser, get_current_user
from app.main import app
from app.schemas.member import MemberResponse
from app.schemas.payment import PaymentResponse
from app.services.import_service import import_members_from_file, parse_date
from db.connection import get_pool


@pytest.fixture
def mock_db_pool():
    mock = AsyncMock()
    app.dependency_overrides[get_pool] = lambda: mock
    yield mock
    app.dependency_overrides.pop(get_pool, None)


@pytest.fixture
def mock_admin_auth():
    user = AuthenticatedUser(
        id=uuid4(),
        email="admin@fitnessgarage.com",
        role="admin",
    )
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.anyio
async def test_date_parser_formats():
    assert parse_date("2026-08-16") == date(2026, 8, 16)
    assert parse_date("16/08/2026") == date(2026, 8, 16)
    assert parse_date("16-08-2026") == date(2026, 8, 16)
    assert parse_date("08/16/2026") == date(2026, 8, 16)
    assert parse_date(date(2026, 8, 16)) == date(2026, 8, 16)


@pytest.mark.anyio
async def test_bulk_csv_import_flow(mock_db_pool: AsyncMock):
    csv_content = b"""full_name,phone_number,email_address,tier,duration,start_date,expiry_date,notes
Rohan Sharma,9876543210,rohan@example.com,basic,monthly,2026-08-01,2026-08-31,Morning regular
Priya Patel,9876543211,priya@example.com,pt,quarterly,2026-07-01,2026-09-30,Goal 5kg cut
Vikram Singh,9876543212,vikram@example.com,basic,annual,2026-01-01,2026-12-31,VIP Member
"""

    mock_plans = [
        {"id": uuid4(), "tier": "basic", "duration": "monthly"},
        {"id": uuid4(), "tier": "pt", "duration": "quarterly"},
        {"id": uuid4(), "tier": "basic", "duration": "annual"},
    ]

    with (
        patch("db.queries.plan_queries.get_all_plans", return_value=mock_plans),
        patch(
            "app.services.import_service.create_new_member", return_value=AsyncMock()
        ) as mock_create,
    ):
        result = await import_members_from_file(
            pool=mock_db_pool,
            file_bytes=csv_content,
            filename="members_batch_1.csv",
        )
        assert result["imported_count"] == 3
        assert result["failed_count"] == 0
        assert mock_create.call_count == 3


@pytest.mark.anyio
async def test_admin_member_and_payment_e2e(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_admin_auth: AuthenticatedUser
):
    member_id = uuid4()
    plan_id = uuid4()

    mock_member = MemberResponse(
        id=member_id,
        supabase_user_id=None,
        full_name="Arjun Kapoor",
        phone_number="9876500000",
        email_address="arjun@example.com",
        membership_plan_id=plan_id,
        status="active",
        start_date=date(2026, 8, 1),
        expiry_date=date(2026, 8, 31),
        imported=False,
        notes="New signup",
        created_at=datetime(2026, 8, 1, 10, 0, 0),
        updated_at=datetime(2026, 8, 1, 10, 0, 0),
    )

    mock_payment = PaymentResponse(
        id=uuid4(),
        member_id=member_id,
        membership_plan_id=plan_id,
        amount=Decimal("3500.00"),
        payment_date=date(2026, 8, 1),
        payment_method="upi",
        invoice_path=f"invoices/{member_id}/inv-001.pdf",
        notes="First month pass",
        recorded_by=mock_admin_auth.id,
        member_name="Arjun Kapoor",
        plan_name="BASIC (Monthly)",
        created_at=datetime(2026, 8, 1, 10, 0, 0),
        updated_at=datetime(2026, 8, 1, 10, 0, 0),
    )

    with (
        patch("app.services.member_service.create_new_member", return_value=mock_member),
        patch("app.services.payment_service.record_payment", return_value=mock_payment),
    ):
        # 1. Create Member
        create_resp = await client.post(
            "/api/v1/admin/members",
            json={
                "full_name": "Arjun Kapoor",
                "phone_number": "9876500000",
                "email_address": "arjun@example.com",
                "membership_plan_id": str(plan_id),
                "status": "active",
                "start_date": "2026-08-01",
                "expiry_date": "2026-08-31",
                "notes": "New signup",
            },
        )
        assert create_resp.status_code == 200
        created_data = create_resp.json()["data"]
        assert created_data["full_name"] == "Arjun Kapoor"

        # 2. Record Payment
        payment_resp = await client.post(
            "/api/v1/admin/payments",
            json={
                "member_id": str(member_id),
                "membership_plan_id": str(plan_id),
                "amount": 3500.0,
                "payment_date": "2026-08-01",
                "payment_method": "upi",
                "notes": "First month pass",
                "generate_invoice": True,
            },
        )
        assert payment_resp.status_code == 200
        pay_data = payment_resp.json()["data"]
        assert pay_data["amount"] == "3500.00"
        assert pay_data["invoice_path"] is not None
