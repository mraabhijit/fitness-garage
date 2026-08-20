from typing import List, Optional, Tuple
from uuid import UUID

import asyncpg

from app.core.security import decrypt_pii, encrypt_pii
from app.schemas.member import MemberCreate, MemberResponse, MemberUpdate
from app.schemas.plan import MembershipPlanResponse
from db.queries import member_queries


def record_to_member_response(rec: asyncpg.Record) -> MemberResponse:
    plan_obj = None
    if rec.get("membership_plan_id") and rec.get("plan_tier"):
        plan_obj = MembershipPlanResponse(
            id=rec["membership_plan_id"],
            tier=rec["plan_tier"],
            duration=rec["plan_duration"],
            price=rec["plan_price"],
            description=None,
            is_active=True,
            created_at=rec["created_at"],
            updated_at=rec["updated_at"],
        )

    return MemberResponse(
        id=rec["id"],
        supabase_user_id=rec.get("supabase_user_id"),
        full_name=decrypt_pii(rec["full_name"]) or "",
        phone_number=decrypt_pii(rec.get("phone_number")),
        email_address=decrypt_pii(rec.get("email_address")),
        membership_plan_id=rec.get("membership_plan_id"),
        plan=plan_obj,
        status=rec["status"],
        start_date=rec["start_date"],
        expiry_date=rec["expiry_date"],
        imported=rec.get("imported", False),
        notes=rec.get("notes"),
        created_at=rec["created_at"],
        updated_at=rec["updated_at"],
    )


async def list_members(
    pool: asyncpg.Pool,
    page: int = 1,
    page_size: int = 20,
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
) -> Tuple[List[MemberResponse], int]:
    offset = (page - 1) * page_size

    # If searching in encrypted fields, fetch all and filter in Python
    if search:
        all_records = await member_queries.get_all_members(pool)
        filtered = []
        search_lower = search.lower()
        for r in all_records:
            name = (decrypt_pii(r["full_name"]) or "").lower()
            phone = (decrypt_pii(r.get("phone_number")) or "").lower()
            email = (decrypt_pii(r.get("email_address")) or "").lower()
            if status_filter and r["status"] != status_filter:
                continue
            if search_lower in name or search_lower in phone or search_lower in email:
                filtered.append(record_to_member_response(r))
        total = len(filtered)
        return filtered[offset : offset + page_size], total

    records, total = await member_queries.get_members_paginated(
        pool, limit=page_size, offset=offset, status_filter=status_filter
    )
    return [record_to_member_response(r) for r in records], total


async def get_member(pool: asyncpg.Pool, member_id: UUID) -> Optional[MemberResponse]:
    rec = await member_queries.get_member_by_id(pool, member_id)
    return record_to_member_response(rec) if rec else None


async def get_member_by_auth(
    pool: asyncpg.Pool, supabase_user_id: UUID
) -> Optional[MemberResponse]:
    rec = await member_queries.get_member_by_supabase_id(pool, supabase_user_id)
    return record_to_member_response(rec) if rec else None


async def create_new_member(pool: asyncpg.Pool, data: MemberCreate) -> MemberResponse:
    full_name_enc = encrypt_pii(data.full_name) or ""
    phone_enc = encrypt_pii(data.phone_number)
    email_enc = encrypt_pii(str(data.email_address)) if data.email_address else None

    rec = await member_queries.create_member(
        pool=pool,
        full_name_enc=full_name_enc,
        phone_number_enc=phone_enc,
        email_address_enc=email_enc,
        membership_plan_id=data.membership_plan_id,
        status=data.status,
        start_date=data.start_date,
        expiry_date=data.expiry_date,
        supabase_user_id=data.supabase_user_id,
        imported=data.imported,
        notes=data.notes,
    )
    if not rec:
        raise RuntimeError("Failed to create member")
    return record_to_member_response(rec)


async def update_existing_member(
    pool: asyncpg.Pool, member_id: UUID, data: MemberUpdate
) -> Optional[MemberResponse]:
    full_name_enc = encrypt_pii(data.full_name) if data.full_name else None
    phone_enc = encrypt_pii(data.phone_number) if data.phone_number else None
    email_enc = encrypt_pii(str(data.email_address)) if data.email_address else None

    rec = await member_queries.update_member(
        pool=pool,
        member_id=member_id,
        full_name_enc=full_name_enc,
        phone_number_enc=phone_enc,
        email_address_enc=email_enc,
        membership_plan_id=data.membership_plan_id,
        status=data.status,
        start_date=data.start_date,
        expiry_date=data.expiry_date,
        notes=data.notes,
        supabase_user_id=data.supabase_user_id,
    )
    return record_to_member_response(rec) if rec else None
