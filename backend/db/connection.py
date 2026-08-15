import logging
from typing import AsyncGenerator
import asyncpg
from app.core.config import settings

logger = logging.getLogger("fitness_garage.db")

_pool: asyncpg.Pool | None = None


async def init_pool() -> asyncpg.Pool | None:
    global _pool
    if not settings.DATABASE_URL:
        logger.warning("DATABASE_URL is not set. Database connection pool initialization skipped.")
        return None

    try:
        _pool = await asyncpg.create_pool(
            dsn=settings.DATABASE_URL,
            min_size=settings.DB_POOL_MIN_SIZE,
            max_size=settings.DB_POOL_MAX_SIZE,
            timeout=10.0,
        )
        logger.info("Database connection pool initialized successfully.")
        return _pool
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        return None


async def close_pool() -> None:
    global _pool
    if _pool:
        await _pool.close()
        _pool = None
        logger.info("Database connection pool closed.")


async def get_pool() -> asyncpg.Pool:
    if _pool is None:
        raise RuntimeError("Database pool is not initialized. Check your DATABASE_URL configuration.")
    return _pool


async def get_db_connection() -> AsyncGenerator[asyncpg.Connection, None]:
    pool = await get_pool()
    async with pool.acquire() as conn:
        yield conn
