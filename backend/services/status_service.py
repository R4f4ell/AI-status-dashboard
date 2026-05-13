from datetime import UTC, datetime

import httpx

from core.config import settings
from repositories.history_repository import add_history_item
from repositories.history_repository import list_history
from repositories.provider_repository import get_provider_by_name, list_providers
from schemas.status import (
    ProviderStatusDetailResponse,
    ProviderStatusResponse,
    StatusSummaryResponse,
)
from utils.cache import get_cache, set_cache
from utils.http import get_json, get_text
from utils.status_mapping import (
    normalize_provider_status,
    normalize_scraped_provider_status,
)


async def get_all_provider_statuses() -> list[ProviderStatusResponse]:
    timeout = httpx.Timeout(settings.api_timeout_seconds)

    async with httpx.AsyncClient(timeout=timeout) as client:
        return [
            await get_provider_status(client, provider)
            for provider in list_providers()
        ]


async def get_status_summary() -> StatusSummaryResponse:
    provider_statuses = await get_all_provider_statuses()
    response_times = [
        provider_status.response_time_ms
        for provider_status in provider_statuses
        if provider_status.response_time_ms is not None
    ]

    average_response_time_ms = (
        int(sum(response_times) / len(response_times))
        if response_times
        else None
    )

    return StatusSummaryResponse(
        total_providers=len(provider_statuses),
        operational=count_status(provider_statuses, "operational"),
        degraded=count_status(provider_statuses, "degraded"),
        partial_outage=count_status(provider_statuses, "partial_outage"),
        major_outage=count_status(provider_statuses, "major_outage"),
        unknown=count_status(provider_statuses, "unknown"),
        average_response_time_ms=average_response_time_ms,
        checked_at=datetime.now(UTC),
    )


async def get_provider_status_detail(
    provider_name: str,
) -> ProviderStatusDetailResponse | None:
    provider = get_provider_by_name(provider_name)

    if provider is None:
        return None

    timeout = httpx.Timeout(settings.api_timeout_seconds)

    async with httpx.AsyncClient(timeout=timeout) as client:
        provider_status = await get_provider_status(client, provider)

    return ProviderStatusDetailResponse(
        current=provider_status,
        history=list_history(provider.name),
    )


def count_status(
    provider_statuses: list[ProviderStatusResponse],
    status: str,
) -> int:
    return sum(
        1
        for provider_status in provider_statuses
        if provider_status.status == status
    )


async def get_provider_status(
    client: httpx.AsyncClient,
    provider,
) -> ProviderStatusResponse:
    cache_key = f"provider_status:{provider.name}"
    cached_status = get_cache(cache_key)

    if isinstance(cached_status, ProviderStatusResponse):
        return cached_status

    checked_at = datetime.now(UTC)
    if provider.source_type == "scraping":
        provider_status = await get_scraped_provider_status(
            client,
            provider,
            checked_at,
        )

        add_history_item(provider_status)

        return set_cache(
            cache_key,
            provider_status,
            settings.cache_ttl_seconds,
        )

    data, response_time_ms, error_message = await get_json(
        client,
        provider.status_api_url,
    )

    if error_message is not None or data is None:
        provider_status = ProviderStatusResponse(
            provider=provider.name,
            display_name=provider.display_name,
            status="unknown",
            response_time_ms=response_time_ms,
            checked_at=checked_at,
            message=error_message or "Provider status could not be checked",
            source=provider.source_type,
        )

        add_history_item(provider_status)

        return set_cache(
            cache_key,
            provider_status,
            settings.cache_ttl_seconds,
        )

    status, message = normalize_provider_status(data)

    provider_status = ProviderStatusResponse(
        provider=provider.name,
        display_name=provider.display_name,
        status=status,
        response_time_ms=response_time_ms,
        checked_at=checked_at,
        message=message,
        source=provider.source_type,
    )

    add_history_item(provider_status)

    return set_cache(
        cache_key,
        provider_status,
        settings.cache_ttl_seconds,
    )


async def get_scraped_provider_status(
    client: httpx.AsyncClient,
    provider,
    checked_at: datetime,
) -> ProviderStatusResponse:
    content, response_time_ms, error_message = await get_text(
        client,
        provider.status_api_url,
    )

    if error_message is not None or content is None:
        return ProviderStatusResponse(
            provider=provider.name,
            display_name=provider.display_name,
            status="unknown",
            response_time_ms=response_time_ms,
            checked_at=checked_at,
            message=error_message or "Provider status could not be checked",
            source=provider.source_type,
        )

    status, message = normalize_scraped_provider_status(provider.name, content)

    return ProviderStatusResponse(
        provider=provider.name,
        display_name=provider.display_name,
        status=status,
        response_time_ms=response_time_ms,
        checked_at=checked_at,
        message=message,
        source=provider.source_type,
    )
