from datetime import date
from decimal import Decimal
from typing import Any, List, Optional, Tuple
from uuid import UUID

import asyncpg


async def get_payments_paginated(
    pool: asyncpg.Pool,
    member_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    limit: int = 20,
    offset: int = 0,
) -> Tuple[List[asyncpg.Record], int]:
    conditions = []
    params: List[Any] = []

    if member_id:
        params.append(member_id)
        conditions.append(f"p.member_id = ${len(params)}")

    if start_date:
        params.append(start_date)
        conditions.append(f"p.payment_date >= ${len(params)}")

    if end_date:
        params.append(end_date)
        conditions.append(f"p.payment_date <= ${len(params)}")

    where_clause = f"WHERE {' AND '.join(conditions)}" if conditions else ""

    count_query = f"SELECT COUNT(*) FROM payments p {where_clause}"
    total = await pool.fetchval(count_query, *params)

    params.append(limit)
    limit_idx = len(params)
    params.append(offset)
    offset_idx = len(params)

    data_query = f"""
        SELECT p.id, p.member_id, p.membership_plan_id, p.amount,
               p.payment_date, p.payment_method, p.invoice_path, p.notes,
               p.recorded_by, p.created_at, p.updated_at,
               m.full_name AS member_name_enc,
               mp.tier AS plan_tier, mp.duration AS plan_duration
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.id
        {where_clause}
        ORDER BY p.payment_date DESC, p.created_at DESC
        LIMIT ${limit_idx} OFFSET ${offset_idx}
    """
    rows = await pool.fetch(data_query, *params)
    return rows, total or 0


async def get_payment_by_id(pool: asyncpg.Pool, payment_id: UUID) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        SELECT p.id, p.member_id, p.membership_plan_id, p.amount,
               p.payment_date, p.payment_method, p.invoice_path, p.notes,
               p.recorded_by, p.created_at, p.updated_at,
               m.full_name AS member_name_enc,
               mp.tier AS plan_tier, mp.duration AS plan_duration
        FROM payments p
        LEFT JOIN members m ON p.member_id = m.id
        LEFT JOIN membership_plans mp ON p.membership_plan_id = mp.id
        WHERE p.id = $1
        """,
        payment_id,
    )


async def create_payment(
    pool: asyncpg.Pool,
    member_id: UUID,
    membership_plan_id: Optional[UUID],
    amount: Decimal,
    payment_date: date,
    payment_method: str,
    invoice_path: Optional[str] = None,
    notes: Optional[str] = None,
    recorded_by: Optional[UUID] = None,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        INSERT INTO payments (
            member_id, membership_plan_id, amount, payment_date,
            payment_method, invoice_path, notes, recorded_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id, member_id, membership_plan_id, amount, payment_date,
                  payment_method, invoice_path, notes, recorded_by, created_at, updated_at
        """,
        member_id,
        membership_plan_id,
        amount,
        payment_date,
        payment_method,
        invoice_path,
        notes,
        recorded_by,
    )


async def update_payment_invoice_path(
    pool: asyncpg.Pool,
    payment_id: UUID,
    invoice_path: str,
) -> Optional[asyncpg.Record]:
    return await pool.fetchrow(
        """
        UPDATE payments
        SET invoice_path = $2
        WHERE id = $1
        RETURNING id, invoice_path, updated_at
        """,
        payment_id,
        invoice_path,
    )
