from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class GalleryBase(BaseModel):
    folder_path: str = Field(
        ...,
        pattern="^(assets/gallery|assets/transformations)$",
        description="Storage folder category",
    )
    file_name: str = Field(..., min_length=1)
    media_type: str = Field(..., pattern="^(image|video)$")
    caption: Optional[str] = None
    display_order: int = Field(default=0, ge=0)
    is_active: bool = True


class GalleryCreate(GalleryBase):
    uploaded_by: Optional[UUID] = None


class GalleryUpdate(BaseModel):
    caption: Optional[str] = None
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None


class GalleryResponse(GalleryBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    url: Optional[str] = None
    uploaded_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
