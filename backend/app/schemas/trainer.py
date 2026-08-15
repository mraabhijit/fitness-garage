from datetime import datetime
from typing import List, Optional
from uuid import UUID
from pydantic import BaseModel, ConfigDict, Field


class TrainerBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    slug: str = Field(..., min_length=2, max_length=100)
    specialization: str = Field(..., min_length=2, max_length=150)
    experience_years: int = Field(default=0, ge=0)
    certifications: List[str] = Field(default_factory=list)
    bio: Optional[str] = None
    photo_filename: Optional[str] = None
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True


class TrainerCreate(TrainerBase):
    pass


class TrainerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    slug: Optional[str] = Field(None, min_length=2, max_length=100)
    specialization: Optional[str] = None
    experience_years: Optional[int] = Field(None, ge=0)
    certifications: Optional[List[str]] = None
    bio: Optional[str] = None
    photo_filename: Optional[str] = None
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class TrainerResponse(TrainerBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime
