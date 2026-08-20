from datetime import date, datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class PaymentBase(BaseModel):
    member_id: UUID
    membership_plan_id: Optional[UUID] = None
    amount: Decimal = Field(..., gt=0, description="Payment amount in INR")
    payment_date: date = Field(default_factory=date.today)
    payment_method: str = Field(
        default="cash",
        pattern="^(cash|card|upi|bank_transfer|other)$",
    )
    notes: Optional[str] = None


class PaymentCreate(PaymentBase):
    generate_invoice: bool = True


class PaymentResponse(PaymentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    invoice_path: Optional[str] = None
    recorded_by: Optional[UUID] = None
    member_name: Optional[str] = None
    plan_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class InvoiceUrlResponse(BaseModel):
    payment_id: UUID
    download_url: str
    expires_in_seconds: int = 3600
