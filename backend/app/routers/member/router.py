from uuid import UUID
import asyncpg
from fastapi import APIRouter, Depends, HTTPException, status
from app.core.auth import AuthenticatedUser, require_member
from app.schemas.common import PaginatedResponse, SuccessResponse
from app.schemas.member import MemberResponse
from app.schemas.payment import InvoiceUrlResponse, PaymentResponse
from app.services import member_service, payment_service
from app.services.storage_service import get_invoice_signed_url
from db.connection import get_pool
from db.queries import payment_queries

router = APIRouter(prefix="/member", tags=["Member Portal"])


@router.get("/me", response_model=SuccessResponse[MemberResponse])
async def get_my_profile(
    current_user: AuthenticatedUser = Depends(require_member),
    pool: asyncpg.Pool = Depends(get_pool),
):
    member = await member_service.get_member_by_auth(pool, current_user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not linked to this account. Please contact gym admin.",
        )
    return SuccessResponse(data=member)


@router.get("/payments", response_model=PaginatedResponse[PaymentResponse])
async def get_my_payments(
    page: int = 1,
    page_size: int = 20,
    current_user: AuthenticatedUser = Depends(require_member),
    pool: asyncpg.Pool = Depends(get_pool),
):
    member = await member_service.get_member_by_auth(pool, current_user.id)
    if not member:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Member profile not linked.",
        )

    payments, total = await payment_service.list_payments(
        pool=pool,
        member_id=member.id,
        page=page,
        page_size=page_size,
    )
    return PaginatedResponse(
        data=payments,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.get("/payments/{payment_id}/invoice", response_model=SuccessResponse[InvoiceUrlResponse])
async def get_payment_invoice(
    payment_id: UUID,
    current_user: AuthenticatedUser = Depends(require_member),
    pool: asyncpg.Pool = Depends(get_pool),
):
    member = await member_service.get_member_by_auth(pool, current_user.id)
    if not member:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Member not found")

    payment_rec = await payment_queries.get_payment_by_id(pool, payment_id)
    if not payment_rec or payment_rec["member_id"] != member.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Payment record not found")

    invoice_path = payment_rec.get("invoice_path")
    if not invoice_path:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Invoice not generated for this payment")

    signed_url = await get_invoice_signed_url(invoice_path, expires_in=3600)
    return SuccessResponse(
        data=InvoiceUrlResponse(
            payment_id=payment_id,
            download_url=signed_url,
            expires_in_seconds=3600,
        )
    )
