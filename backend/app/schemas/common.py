from typing import Generic, List, Optional, TypeVar

from pydantic import BaseModel, Field

T = TypeVar("T")


class SuccessResponse(BaseModel, Generic[T]):
    data: T
    message: str = "Operation successful"


class PaginatedResponse(BaseModel, Generic[T]):
    data: List[T]
    total: int
    page: int = 1
    page_size: int = 20
    next_cursor: Optional[str] = None
    message: str = "Operation successful"


class ErrorResponse(BaseModel):
    error: str
    message: str
    status: int = 400


class PaginationParams(BaseModel):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    search: Optional[str] = None
