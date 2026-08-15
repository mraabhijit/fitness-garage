from datetime import date, datetime
from typing import Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class ReviewBase(BaseModel):
    google_review_id: str
    reviewer_name: str
    review_text: Optional[str] = None
    rating: int = Field(..., ge=1, le=5)
    review_date: date
    is_visible: bool = True


class ReviewCreate(ReviewBase):
    pass


class ReviewUpdate(BaseModel):
    is_visible: bool


class ReviewResponse(ReviewBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    last_synced_at: datetime
    created_at: datetime
    updated_at: datetime
