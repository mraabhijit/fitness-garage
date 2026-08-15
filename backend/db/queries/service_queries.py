from typing import List, Optional
from uuid import UUID
import asyncpg


async def get_all_services(pool: asyncpg.Pool, active_only: bool = False) -> List[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, name, slug, description, icon_filename, display_order, is_active,
               created_at, updated_at
        FROM services
        WHERE (NOT $1::bool OR is_active = TRUE)
        ORDER BY display_order ASC, name ASC
        """,
        active_only,
    )


async def get_service_by_id(pool: asyncpg.Pool, service_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, name, slug, description, icon_filename, display_order, is_active,
               created_at, updated_at
        FROM services
        WHERE id = $1
        """,
        service_id,
    )


async def get_service_by_slug(pool: asyncpg.Pool, slug: str) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, name, slug, description, icon_filename, display_order, is_active,
               created_at, updated_at
        FROM services
        WHERE slug = $1
        """,
        slug,
    )


async def create_service(
    pool: asyncpg.Pool,
    name: str,
    slug: str,
    description: Optional[str] = None,
    icon_filename: Optional[str] = None,
    display_order: int = 0,
    is_active: bool = True,
) -> asyncpg.Record:
    return await pool.fetchrow(
        """
        INSERT INTO services (
            name, slug, description, icon_filename, display_order, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, name, slug, description, icon_filename, display_order, is_active,
                  created_at, updated_at
        """,
        name,
        slug,
        description,
        icon_filename,
        display_order,
        is_active,
    )


async def update_service(
    pool: asyncpg.Pool,
    service_id: UUID,
    name: Optional[str] = None,
    slug: Optional[str] = None,
    description: Optional[str] = None,
    icon_filename: Optional[str] = None,
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE services
        SET name = COALESCE($2, name),
            slug = COALESCE($3, slug),
            description = COALESCE($4, description),
            icon_filename = COALESCE($5, icon_filename),
            display_order = COALESCE($6, display_order),
            is_active = COALESCE($7, is_active)
        WHERE id = $1
        RETURNING id, name, slug, description, icon_filename, display_order, is_active,
                  created_at, updated_at
        """,
        service_id,
        name,
        slug,
        description,
        icon_filename,
        display_order,
        is_active,
    )


async def soft_delete_service(pool: asyncpg.Pool, service_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE services
        SET is_active = FALSE
        WHERE id = $1
        RETURNING id, is_active, updated_at
        """,
        service_id,
    )
