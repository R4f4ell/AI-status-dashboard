from core.config import settings
from schemas.status import ProviderStatusResponse, StatusHistoryItem


history_store: dict[str, list[StatusHistoryItem]] = {}


def add_history_item(provider_status: ProviderStatusResponse) -> None:
    provider_history = history_store.setdefault(provider_status.provider, [])

    provider_history.append(
        StatusHistoryItem(
            provider=provider_status.provider,
            status=provider_status.status,
            response_time_ms=provider_status.response_time_ms,
            checked_at=provider_status.checked_at,
            message=provider_status.message,
        )
    )

    if len(provider_history) > settings.history_limit_per_provider:
        del provider_history[: -settings.history_limit_per_provider]


def list_history(provider_name: str) -> list[StatusHistoryItem]:
    return history_store.get(provider_name, [])
