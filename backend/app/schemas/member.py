from datetime import date, datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field

from app.schemas.plan import MembershipPlanResponse


class MemberBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    phone_number: Optional[str] = Field(None, max_length=25)
    email_address: Optional[EmailStr] = None
    membership_plan_id: Optional[UUID] = None
    status: str = Field(default="active", pattern="^(active|expired|pending|suspended)$")
    start_date: date
    expiry_date: date
    notes: Optional[str] = None


class MemberCreate(MemberBase):
    supabase_user_id: Optional[UUID] = None
    imported: bool = False


class MemberUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    phone_number: Optional[str] = None
    email_address: Optional[EmailStr] = None
    membership_plan_id: Optional[UUID] = None
    status: Optional[str] = Field(None, pattern="^(active|expired|pending|suspended)$")
    start_date: Optional[date] = None
    expiry_date: Optional[date] = None
    notes: Optional[str] = None
    supabase_user_id: Optional[UUID] = None


class MemberResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    supabase_user_id: Optional[UUID] = None
    full_name: str
    phone_number: Optional[str] = None
    email_address: Optional[str] = None
    membership_plan_id: Optional[UUID] = None
    plan: Optional[MembershipPlanResponse] = None
    status: str
    start_date: date
    expiry_date: date
    imported: bool
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class MemberSelfResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    full_name: str
    phone_number: Optional[str] = None
    email_address: Optional[str] = None
    membership_plan_id: Optional[UUID] = None
    plan: Optional[MembershipPlanResponse] = None
    status: str
    start_date: date
    expiry_date: date
    created_at: datetime
