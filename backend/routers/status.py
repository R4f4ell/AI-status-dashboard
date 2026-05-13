from fastapi import APIRouter, HTTPException

from schemas.status import (
    ProviderStatusDetailResponse,
    ProviderStatusResponse,
    StatusSummaryResponse,
)
from services.status_service import (
    get_all_provider_statuses,
    get_provider_status_detail,
    get_status_summary,
)


router = APIRouter(prefix="/status", tags=["status"])


@router.get("/summary", response_model=StatusSummaryResponse)
async def get_summary() -> StatusSummaryResponse:
    return await get_status_summary()


@router.get("/providers", response_model=list[ProviderStatusResponse])
async def get_status_providers() -> list[ProviderStatusResponse]:
    return await get_all_provider_statuses()


@router.get("/providers/{provider_name}", response_model=ProviderStatusDetailResponse)
async def get_status_provider(
    provider_name: str,
) -> ProviderStatusDetailResponse:
    provider_status = await get_provider_status_detail(provider_name)

    if provider_status is None:
        raise HTTPException(status_code=404, detail="Provider not found")

    return provider_status
