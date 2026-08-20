from datetime import date, datetime
from decimal import Decimal
from unittest.mock import AsyncMock, patch
from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.auth import AuthenticatedUser, get_current_user
from app.main import app
from app.schemas.member import MemberResponse
from app.schemas.plan import MembershipPlanResponse
from db.connection import get_pool


@pytest.fixture
def mock_db_pool():
    mock = AsyncMock()
    app.dependency_overrides[get_pool] = lambda: mock
    yield mock
    app.dependency_overrides.pop(get_pool, None)


@pytest.fixture
def mock_member_auth():
    user = AuthenticatedUser(
        id=uuid4(),
        email="member@fitnessgarage.com",
        role="member",
    )
    app.dependency_overrides[get_current_user] = lambda: user
    yield user
    app.dependency_overrides.pop(get_current_user, None)


@pytest.mark.anyio
async def test_member_me_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/member/me")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_member_me_authenticated(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_member_auth: AuthenticatedUser
):
    member_id = uuid4()
    mock_member_resp = MemberResponse(
        id=member_id,
        supabase_user_id=mock_member_auth.id,
        full_name="Test Athlete",
        phone_number="9876543210",
        email_address="member@fitnessgarage.com",
        membership_plan_id=uuid4(),
        status="active",
        start_date=date(2026, 1, 1),
        expiry_date=date(2026, 12, 31),
        imported=False,
        notes=None,
        created_at=datetime(2026, 1, 1, 0, 0, 0),
        updated_at=datetime(2026, 1, 1, 0, 0, 0),
        plan=MembershipPlanResponse(
            id=uuid4(),
            tier="pt",
            duration="annual",
            price=Decimal("25000.00"),
            description="Annual PT Pass",
            is_active=True,
            created_at=datetime(2026, 1, 1, 0, 0, 0),
            updated_at=datetime(2026, 1, 1, 0, 0, 0),
        ),
    )

    with patch(
        "app.services.member_service.get_member_by_auth",
        return_value=mock_member_resp,
    ):
        response = await client.get("/api/v1/member/me")
        assert response.status_code == 200
        data = response.json()
        assert data["data"]["id"] == str(member_id)
        assert data["data"]["full_name"] == "Test Athlete"
        assert data["data"]["status"] == "active"


@pytest.mark.anyio
async def test_member_payments_list(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_member_auth: AuthenticatedUser
):
    member_id = uuid4()
    mock_member_resp = MemberResponse(
        id=member_id,
        supabase_user_id=mock_member_auth.id,
        full_name="Test Athlete",
        phone_number="9876543210",
        email_address="member@fitnessgarage.com",
        membership_plan_id=uuid4(),
        status="active",
        start_date=date(2026, 1, 1),
        expiry_date=date(2026, 12, 31),
        imported=False,
        notes=None,
        created_at=datetime(2026, 1, 1, 0, 0, 0),
        updated_at=datetime(2026, 1, 1, 0, 0, 0),
    )

    with (
        patch(
            "app.services.member_service.get_member_by_auth",
            return_value=mock_member_resp,
        ),
        patch(
            "app.services.payment_service.list_payments",
            return_value=([], 0),
        ),
    ):
        response = await client.get("/api/v1/member/payments")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"] == []
        assert data["total"] == 0
