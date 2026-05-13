from datetime import datetime
from typing import Literal

from pydantic import BaseModel


ProviderStatus = Literal[
    "operational",
    "degraded",
    "partial_outage",
    "major_outage",
    "unknown",
]

ProviderSource = Literal["api", "scraping", "mock"]


class ProviderStatusResponse(BaseModel):
    provider: str
    display_name: str
    status: ProviderStatus
    response_time_ms: int | None
    checked_at: datetime
    message: str
    source: ProviderSource


class StatusHistoryItem(BaseModel):
    provider: str
    status: ProviderStatus
    response_time_ms: int | None
    checked_at: datetime
    message: str


class ProviderStatusDetailResponse(BaseModel):
    current: ProviderStatusResponse
    history: list[StatusHistoryItem]


class StatusSummaryResponse(BaseModel):
    total_providers: int
    operational: int
    degraded: int
    partial_outage: int
    major_outage: int
    unknown: int
    average_response_time_ms: int | None
    checked_at: datetime
