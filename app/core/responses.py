from __future__ import annotations

from typing import Any, Generic, TypeVar

from pydantic import BaseModel

T = TypeVar("T")


class ErrorResponse(BaseModel):
    error: dict[str, Any]


class SuccessResponse(BaseModel, Generic[T]):
    data: T
    meta: dict[str, Any] | None = None

