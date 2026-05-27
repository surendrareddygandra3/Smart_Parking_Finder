from __future__ import annotations

from dataclasses import dataclass
from typing import Any


@dataclass
class AppError(Exception):
    """
    Domain-level error that can be converted into a consistent API response.
    """

    code: str
    message: str
    status_code: int = 400
    details: dict[str, Any] | None = None

