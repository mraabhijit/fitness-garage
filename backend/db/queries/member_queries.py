from datetime import date
from typing import Any, List, Optional, Tuple
from uuid import UUID

import asyncpg


async def get_members_paginated(
    pool: asyncpg.Pool,
    limit: int = 20,
    offset: int = 0,
    status_filter: Optional[str] = None,
) -> Tuple[List[asyncpg.Record], int]:
    conditions = []
    params: List[Any] = []

    if status_filter:
        params.append(status_filter)
        conditions.append(f"m.status = ${len(params)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    count_query = f"SELECT COUNT(*) FROM members m {where_clause}"
    total = await pool.fetchval(count_query, *params)

    params.append(limit)
    limit_idx = len(params)
    params.append(offset)
    offset_idx = len(params)

    data_query = f"""
        SELECT m.id, m.supabase_user_id, m.full_name, m.phone_number, m.email_address,
               m.membership_plan_id, m.status, m.start_date, m.expiry_date,
               m.imported, m.notes, m.created_at, m.updated_at,
               p.tier AS plan_tier, p.duration AS plan_duration, p.price AS plan_price
        FROM members m
        LEFT JOIN membership_plans p ON m.membership_plan_id = p.id
        {where_clause}
        ORDER BY m.created_at DESC
        LIMIT ${limit_idx} OFFSET ${offset_idx}
    """
    rows = await pool.fetch(data_query, *params)
    return rows, total or 0


async def get_all_members(pool: asyncpg.Pool) -> List[asyncpg.Record]:
    return await pool.fetch("""
        SELECT m.id, m.supabase_user_id, m.full_name, m.phone_number, m.email_address,
               m.membership_plan_id, m.status, m.start_date, m.expiry_date,
               m.imported, m.notes, m.created_at, m.updated_at,
               p.tier AS plan_tier, p.duration AS plan_duration, p.price AS plan_price
        FROM members m
        LEFT JOIN membership_plans p ON m.membership_plan_id = p.id
        ORDER BY m.created_at DESC
        """)


async def get_member_by_id(pool: asyncpg.Pool, member_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT m.id, m.supabase_user_id, m.full_name, m.phone_number, m.email_address,
               m.membership_plan_id, m.status, m.start_date, m.expiry_date,
               m.imported, m.notes, m.created_at, m.updated_at,
               p.tier AS plan_tier, p.duration AS plan_duration, p.price AS plan_price
        FROM members m
        LEFT JOIN membership_plans p ON m.membership_plan_id = p.id
        WHERE m.id = $1
        """,
        member_id,
    )


async def get_member_by_supabase_id(
    pool: asyncpg.Pool, supabase_user_id: UUID
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT m.id, m.supabase_user_id, m.full_name, m.phone_number, m.email_address,
               m.membership_plan_id, m.status, m.start_date, m.expiry_date,
               m.imported, m.notes, m.created_at, m.updated_at,
               p.tier AS plan_tier, p.duration AS plan_duration, p.price AS plan_price
        FROM members m
        LEFT JOIN membership_plans p ON m.membership_plan_id = p.id
        WHERE m.supabase_user_id = $1
        """,
        supabase_user_id,
    )


async def create_member(
    pool: asyncpg.Pool,
    full_name_enc: str,
    phone_number_enc: Optional[str],
    email_address_enc: Optional[str],
    membership_plan_id: Optional[UUID],
    status: str,
    start_date: date,
    expiry_date: date,
    supabase_user_id: Optional[UUID] = None,
    imported: bool = False,
    notes: Optional[str] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        INSERT INTO members (
            supabase_user_id, full_name, phone_number, email_address,
            membership_plan_id, status, start_date, expiry_date,
            imported, notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING id, supabase_user_id, full_name, phone_number, email_address,
                  membership_plan_id, status, start_date, expiry_date,
                  imported, notes, created_at, updated_at
        """,
        supabase_user_id,
        full_name_enc,
        phone_number_enc,
        email_address_enc,
        membership_plan_id,
        status,
        start_date,
        expiry_date,
        imported,
        notes,
    )


async def update_member(
    pool: asyncpg.Pool,
    member_id: UUID,
    full_name_enc: Optional[str] = None,
    phone_number_enc: Optional[str] = None,
    email_address_enc: Optional[str] = None,
    membership_plan_id: Optional[UUID] = None,
    status: Optional[str] = None,
    start_date: Optional[date] = None,
    expiry_date: Optional[date] = None,
    notes: Optional[str] = None,
    supabase_user_id: Optional[UUID] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE members
        SET full_name = COALESCE($2, full_name),
            phone_number = COALESCE($3, phone_number),
            email_address = COALESCE($4, email_address),
            membership_plan_id = COALESCE($5, membership_plan_id),
            status = COALESCE($6, status),
            start_date = COALESCE($7, start_date),
            expiry_date = COALESCE($8, expiry_date),
            notes = COALESCE($9, notes),
            supabase_user_id = COALESCE($10, supabase_user_id)
        WHERE id = $1
        RETURNING id, supabase_user_id, full_name, phone_number, email_address,
                  membership_plan_id, status, start_date, expiry_date,
                  imported, notes, created_at, updated_at
        """,
        member_id,
        full_name_enc,
        phone_number_enc,
        email_address_enc,
        membership_plan_id,
        status,
        start_date,
        expiry_date,
        notes,
        supabase_user_id,
    )


async def soft_delete_member(pool: asyncpg.Pool, member_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE members
        SET status = 'suspended'
        WHERE id = $1
        RETURNING id, status, updated_at
        """,
        member_id,
    )
