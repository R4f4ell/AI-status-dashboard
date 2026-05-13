import time
from dataclasses import dataclass
from typing import TypeVar


T = TypeVar("T")


@dataclass
class CacheItem:
    value: object
    expires_at: float


cache_store: dict[str, CacheItem] = {}


def get_cache(key: str) -> object | None:
    item = cache_store.get(key)

    if item is None:
        return None

    if item.expires_at <= time.time():
        cache_store.pop(key, None)
        return None

    return item.value


def set_cache(key: str, value: T, ttl_seconds: int) -> T:
    cache_store[key] = CacheItem(
        value=value,
        expires_at=time.time() + ttl_seconds,
    )

    return value
