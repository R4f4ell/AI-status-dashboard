from fastapi import APIRouter

from repositories.provider_repository import list_providers
from schemas.provider import ProviderResponse


router = APIRouter(prefix="/providers", tags=["providers"])


@router.get("", response_model=list[ProviderResponse])
async def get_providers() -> list[ProviderResponse]:
    return [
        ProviderResponse(
            name=provider.name,
            display_name=provider.display_name,
            status_url=provider.status_url,
            source_type=provider.source_type,
        )
        for provider in list_providers()
    ]
