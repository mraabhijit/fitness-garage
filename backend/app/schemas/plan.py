from datetime import datetime
from decimal import Decimal
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class MembershipPlanBase(BaseModel):
    tier: str = Field(..., description="Plan tier: basic or pt")
    duration: str = Field(..., description="Duration: monthly, quarterly, half_yearly, annual")
    price: Decimal = Field(..., ge=0, description="Plan price in INR")
    description: Optional[str] = None
    is_active: bool = True


class MembershipPlanCreate(MembershipPlanBase):
    pass


class MembershipPlanUpdate(BaseModel):
    price: Optional[Decimal] = Field(None, ge=0)
    description: Optional[str] = None
    is_active: Optional[bool] = None


class MembershipPlanResponse(MembershipPlanBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
