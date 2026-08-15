from datetime import date
from decimal import Decimal
from typing import List, Optional, Tuple
from uuid import UUID
import asyncpg
from app.core.security import decrypt_pii
from app.schemas.payment import PaymentCreate, PaymentResponse
from app.services.invoice_service import generate_invoice_pdf, upload_invoice_to_storage
from db.queries import member_queries, payment_queries, plan_queries


def record_to_payment_response(rec: asyncpg.Record) -> PaymentResponse:
    member_name = None
    if rec.get("member_name_enc"):
        member_name = decrypt_pii(rec["member_name_enc"])

    plan_name = None
    if rec.get("plan_tier"):
        plan_name = f"{rec['plan_tier'].upper()} ({rec.get('plan_duration', '').capitalize()})"

    return PaymentResponse(
        id=rec["id"],
        member_id=rec["member_id"],
        membership_plan_id=rec.get("membership_plan_id"),
        amount=rec["amount"],
        payment_date=rec["payment_date"],
        payment_method=rec["payment_method"],
        invoice_path=rec.get("invoice_path"),
        notes=rec.get("notes"),
        recorded_by=rec.get("recorded_by"),
        member_name=member_name,
        plan_name=plan_name,
        created_at=rec["created_at"],
        updated_at=rec["updated_at"],
    )


async def list_payments(
    pool: asyncpg.Pool,
    member_id: Optional[UUID] = None,
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[PaymentResponse], int]:
    offset = (page - 1) * page_size
    records, total = await payment_queries.get_payments_paginated(
        pool=pool,
        member_id=member_id,
        start_date=start_date,
        end_date=end_date,
        limit=page_size,
        offset=offset,
    )
    return [record_to_payment_response(r) for r in records], total


async def record_payment(
    pool: asyncpg.Pool, data: PaymentCreate, admin_user_id: Optional[UUID] = None
) -> PaymentResponse:
    # 1. Fetch member to get details for invoice
    member_rec = await member_queries.get_member_by_id(pool, data.member_id)
    if not member_rec:
        raise ValueError(f"Member with ID {data.member_id} not found")

    member_name = decrypt_pii(member_rec["full_name"]) or "Gym Member"
    member_phone = decrypt_pii(member_rec.get("phone_number"))
    member_email = decrypt_pii(member_rec.get("email_address"))

    plan_tier = None
    plan_duration = None
    if data.membership_plan_id:
        plan_rec = await plan_queries.get_plan_by_id(pool, data.membership_plan_id)
        if plan_rec:
            plan_tier = plan_rec["tier"]
            plan_duration = plan_rec["duration"]

    # 2. Insert payment record
    payment_rec = await payment_queries.create_payment(
        pool=pool,
        member_id=data.member_id,
        membership_plan_id=data.membership_plan_id,
        amount=data.amount,
        payment_date=data.payment_date,
        payment_method=data.payment_method,
        invoice_path=None,
        notes=data.notes,
        recorded_by=admin_user_id,
    )
    payment_id = payment_rec["id"]

    # 3. Generate & upload invoice PDF if requested
    invoice_path = None
    if data.generate_invoice:
        pdf_bytes = generate_invoice_pdf(
            payment_id=payment_id,
            member_name=member_name,
            member_email=member_email,
            member_phone=member_phone,
            amount=data.amount,
            payment_date=data.payment_date,
            payment_method=data.payment_method,
            plan_tier=plan_tier,
            plan_duration=plan_duration,
        )
        invoice_path = await upload_invoice_to_storage(
            member_id=data.member_id, payment_id=payment_id, pdf_bytes=pdf_bytes
        )
        await payment_queries.update_payment_invoice_path(pool, payment_id, invoice_path)

    fresh_rec = await payment_queries.get_payment_by_id(pool, payment_id)
    return record_to_payment_response(fresh_rec or payment_rec)
