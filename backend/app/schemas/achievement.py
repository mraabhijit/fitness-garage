from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class AchievementBase(BaseModel):
    label: str = Field(..., min_length=2, max_length=150)
    value: Optional[str] = Field(None, max_length=50)
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True


class AchievementCreate(AchievementBase):
    pass


class AchievementUpdate(BaseModel):
    label: Optional[str] = Field(None, min_length=2, max_length=150)
    value: Optional[str] = Field(None, max_length=50)
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class AchievementResponse(AchievementBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime
