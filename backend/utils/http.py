import time
from typing import Any

import httpx


async def get_json(
    client: httpx.AsyncClient,
    url: str,
) -> tuple[Any | None, int | None, str | None]:
    started_at = time.perf_counter()

    try:
        response = await client.get(
            url,
            headers={
                "Accept": "application/json",
                "User-Agent": "AI Status Dashboard",
            },
        )
        response_time_ms = int((time.perf_counter() - started_at) * 1000)

        if response.status_code == 429:
            return None, response_time_ms, "Rate limit returned by provider"

        if response.status_code >= 500:
            return None, response_time_ms, "Provider returned a server error"

        if response.status_code >= 400:
            return None, response_time_ms, "Provider returned an invalid response"

        try:
            return response.json(), response_time_ms, None
        except ValueError:
            return None, response_time_ms, "Provider returned invalid JSON"

    except httpx.TimeoutException:
        return None, None, "Provider request timed out"
    except httpx.RequestError:
        return None, None, "Provider is unavailable"


async def get_text(
    client: httpx.AsyncClient,
    url: str,
) -> tuple[str | None, int | None, str | None]:
    started_at = time.perf_counter()

    try:
        response = await client.get(
            url,
            headers={
                "Accept": "text/html",
                "User-Agent": "AI Status Dashboard",
            },
        )
        response_time_ms = int((time.perf_counter() - started_at) * 1000)

        if response.status_code == 429:
            return None, response_time_ms, "Rate limit returned by provider"

        if response.status_code >= 500:
            return None, response_time_ms, "Provider returned a server error"

        if response.status_code >= 400:
            return None, response_time_ms, "Provider returned an invalid response"

        return response.text, response_time_ms, None

    except httpx.TimeoutException:
        return None, None, "Provider request timed out"
    except httpx.RequestError:
        return None, None, "Provider is unavailable"
