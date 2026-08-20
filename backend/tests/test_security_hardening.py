from uuid import uuid4

import pytest
from httpx import AsyncClient

from app.core.auth import AuthenticatedUser, get_current_user
from app.core.security import decrypt_pii, encrypt_pii
from app.main import app


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
async def test_aes256_pii_encryption_hardening():
    # 1. Plaintext vs Ciphertext distinction
    raw_name = "Abhijit Chakraborty"
    raw_phone = "+91 98765 43210"
    raw_email = "abhijit@fitnessgarage.com"

    enc_name = encrypt_pii(raw_name)
    enc_phone = encrypt_pii(raw_phone)
    enc_email = encrypt_pii(raw_email)

    assert enc_name is not None
    assert enc_phone is not None
    assert enc_email is not None

    # Ciphertext must NEVER contain plaintext
    assert raw_name not in enc_name
    assert raw_phone not in enc_phone
    assert raw_email not in enc_email

    # 2. Reversible decryption
    assert decrypt_pii(enc_name) == raw_name
    assert decrypt_pii(enc_phone) == raw_phone
    assert decrypt_pii(enc_email) == raw_email

    # 3. None / Empty robustness
    assert encrypt_pii(None) is None
    assert decrypt_pii(None) is None
    assert decrypt_pii("") is None

    # 4. Fallback on plaintext/unencrypted data for non-ciphertext strings
    assert decrypt_pii("plaintext_seed_value") == "plaintext_seed_value"


@pytest.mark.anyio
@pytest.mark.parametrize(
    "method,endpoint,json_payload",
    [
        ("GET", "/api/v1/admin/members", None),
        (
            "POST",
            "/api/v1/admin/members",
            {"full_name": "Test", "start_date": "2026-01-01", "expiry_date": "2026-02-01"},
        ),
        ("GET", f"/api/v1/admin/members/{uuid4()}", None),
        ("DELETE", f"/api/v1/admin/members/{uuid4()}", None),
        ("GET", "/api/v1/admin/payments", None),
        (
            "POST",
            "/api/v1/admin/payments",
            {
                "member_id": str(uuid4()),
                "amount": 100,
                "payment_date": "2026-01-01",
                "payment_method": "cash",
            },
        ),
        ("GET", "/api/v1/admin/plans", None),
        ("GET", "/api/v1/admin/services", None),
        ("GET", "/api/v1/admin/trainers", None),
        ("GET", "/api/v1/admin/gallery", None),
        ("GET", "/api/v1/admin/site-config", None),
        ("GET", "/api/v1/admin/achievements", None),
        ("GET", "/api/v1/admin/reviews", None),
        ("POST", "/api/v1/admin/reviews/sync", None),
    ],
)
async def test_role_escalation_forbidden_for_members(
    client: AsyncClient,
    mock_member_auth: AuthenticatedUser,
    method: str,
    endpoint: str,
    json_payload: dict,
):
    if method == "GET":
        resp = await client.get(endpoint)
    elif method == "POST":
        resp = await client.post(endpoint, json=json_payload)
    elif method == "DELETE":
        resp = await client.delete(endpoint)
    elif method == "PUT":
        resp = await client.put(endpoint, json=json_payload)

    assert resp.status_code == 403


@pytest.mark.anyio
@pytest.mark.parametrize(
    "endpoint",
    [
        "/api/v1/member/me",
        "/api/v1/member/payments",
        "/api/v1/admin/members",
        "/api/v1/admin/payments",
        "/api/v1/admin/plans",
        "/api/v1/admin/site-config",
    ],
)
async def test_unauthenticated_requests_return_401(client: AsyncClient, endpoint: str):
    resp = await client.get(endpoint)
    assert resp.status_code == 401
