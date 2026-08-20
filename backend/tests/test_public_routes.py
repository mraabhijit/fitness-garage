from unittest.mock import AsyncMock, patch

import pytest
from httpx import AsyncClient

from app.main import app
from db.connection import get_pool


@pytest.fixture
def mock_db_pool():
    mock = AsyncMock()
    app.dependency_overrides[get_pool] = lambda: mock
    yield mock
    app.dependency_overrides.pop(get_pool, None)


@pytest.mark.anyio
async def test_get_site_config_empty(client: AsyncClient, mock_db_pool: AsyncMock):
    with patch("db.queries.site_config_queries.get_all_site_configs", return_value=[]):
        response = await client.get("/api/v1/public/site-config")
        assert response.status_code == 200
        data = response.json()
        assert "data" in data
        assert data["message"] == "Operation successful"


@pytest.mark.anyio
async def test_get_plans_empty(client: AsyncClient, mock_db_pool: AsyncMock):
    with patch("db.queries.plan_queries.get_all_plans", return_value=[]):
        response = await client.get("/api/v1/public/plans")
        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []


@pytest.mark.anyio
async def test_get_services_empty(client: AsyncClient, mock_db_pool: AsyncMock):
    with patch("db.queries.service_queries.get_all_services", return_value=[]):
        response = await client.get("/api/v1/public/services")
        assert response.status_code == 200
        data = response.json()
        assert data["data"] == []
