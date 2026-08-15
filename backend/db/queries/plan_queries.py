from decimal import Decimal
from typing import List, Optional
from uuid import UUID
import asyncpg


async def get_all_plans(pool: asyncpg.Pool, active_only: bool = False) -> List[asyncpg.Record]:
    return await pool.fetch(
        """
        SELECT id, tier, duration, price, description, is_active, created_at, updated_at
        FROM membership_plans
        WHERE (NOT $1::bool OR is_active = TRUE)
        ORDER BY tier ASC, duration ASC
        """,
        active_only,
    )


async def get_plan_by_id(pool: asyncpg.Pool, plan_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT id, tier, duration, price, description, is_active, created_at, updated_at
        FROM membership_plans
        WHERE id = $1
        """,
        plan_id,
    )


async def update_plan(
    pool: asyncpg.Pool,
    plan_id: UUID,
    price: Optional[Decimal] = None,
    description: Optional[str] = None,
    is_active: Optional[bool] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE membership_plans
        SET price = COALESCE($2, price),
            description = COALESCE($3, description),
            is_active = COALESCE($4, is_active)
        WHERE id = $1
        RETURNING id, tier, duration, price, description, is_active, created_at, updated_at
        """,
        plan_id,
        price,
        description,
        is_active,
    )
