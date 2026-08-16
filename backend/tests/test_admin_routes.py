from unittest.mock import AsyncMock, patch
from uuid import uuid4
import pytest
from httpx import AsyncClient
from app.main import app
from db.connection import get_pool
from app.core.auth import get_current_user, AuthenticatedUser


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
async def test_admin_members_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/admin/members")
    assert response.status_code == 401


@pytest.mark.anyio
async def test_admin_members_forbidden_for_member_role(
    client: AsyncClient, mock_member_auth: AuthenticatedUser
):
    response = await client.get("/api/v1/admin/members")
    assert response.status_code == 403


@pytest.mark.anyio
async def test_admin_members_success_for_admin_role(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_admin_auth: AuthenticatedUser
):
    with patch(
        "app.services.member_service.list_members",
        return_value=([], 0),
    ):
        response = await client.get("/api/v1/admin/members")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["data"] == []
        assert data["total"] == 0


@pytest.mark.anyio
async def test_admin_plans_list(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_admin_auth: AuthenticatedUser
):
    with patch(
        "db.queries.plan_queries.get_all_plans",
        return_value=[],
    ):
        response = await client.get("/api/v1/admin/plans")
        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []


@pytest.mark.anyio
async def test_admin_services_list(
    client: AsyncClient, mock_db_pool: AsyncMock, mock_admin_auth: AuthenticatedUser
):
    with patch(
        "db.queries.service_queries.get_all_services",
        return_value=[],
    ):
        response = await client.get("/api/v1/admin/services")
        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []
