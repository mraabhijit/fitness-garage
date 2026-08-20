from typing import List, Optional
from uuid import UUID

import asyncpg


async def get_all_achievements(
    pool: asyncpg.Pool, active_only: bool = False
) -> List[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, label, value, display_order, is_active, created_at, updated_at
        FROM achievements
        WHERE (NOT $1::bool OR is_active = TRUE)
        ORDER BY display_order ASC, created_at ASC
        """,
        active_only,
    )


async def get_achievement_by_id(
    pool: asyncpg.Pool, achievement_id: UUID
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, label, value, display_order, is_active, created_at, updated_at
        FROM achievements
        WHERE id = $1
        """,
        achievement_id,
    )


async def create_achievement(
    pool: asyncpg.Pool,
    label: str,
    value: Optional[str] = None,
    display_order: int = 0,
    is_active: bool = True,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        INSERT INTO achievements (label, value, display_order, is_active)
        VALUES ($1, $2, $3, $4)
        RETURNING id, label, value, display_order, is_active, created_at, updated_at
        """,
        label,
        value,
        display_order,
        is_active,
    )


async def update_achievement(
    pool: asyncpg.Pool,
    achievement_id: UUID,
    label: Optional[str] = None,
    value: Optional[str] = None,
    display_order: Optional[int] = None,
    is_active: Optional[bool] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE achievements
        SET label = COALESCE($2, label),
            value = COALESCE($3, value),
            display_order = COALESCE($4, display_order),
            is_active = COALESCE($5, is_active)
        WHERE id = $1
        RETURNING id, label, value, display_order, is_active, created_at, updated_at
        """,
        achievement_id,
        label,
        value,
        display_order,
        is_active,
    )


async def soft_delete_achievement(
    pool: asyncpg.Pool, achievement_id: UUID
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE achievements
        SET is_active = FALSE
        WHERE id = $1
        RETURNING id, is_active, updated_at
        """,
        achievement_id,
    )
