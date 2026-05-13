from models.provider import Provider


PROVIDERS = [
    Provider(
        name="github",
        display_name="GitHub",
        status_url="https://www.githubstatus.com/",
        status_api_url="https://www.githubstatus.com/api/v2/summary.json",
        source_type="api",
    ),
    Provider(
        name="anthropic",
        display_name="Anthropic / Claude",
        status_url="https://status.claude.com/",
        status_api_url="https://status.claude.com/api/v2/summary.json",
        source_type="api",
    ),
    Provider(
        name="vercel",
        display_name="Vercel",
        status_url="https://www.vercel-status.com/",
        status_api_url="https://www.vercel-status.com/api/v2/summary.json",
        source_type="api",
    ),
    Provider(
        name="railway",
        display_name="Railway",
        status_url="https://status.railway.com/",
        status_api_url="https://status.railway.com/",
        source_type="scraping",
    ),
    Provider(
        name="supabase",
        display_name="Supabase",
        status_url="https://status.supabase.com/",
        status_api_url="https://status.supabase.com/api/v2/summary.json",
        source_type="api",
    ),
    Provider(
        name="openai",
        display_name="OpenAI",
        status_url="https://status.openai.com/",
        status_api_url="https://status.openai.com/",
        source_type="scraping",
    ),
    Provider(
        name="google_cloud",
        display_name="Google Cloud / Gemini",
        status_url="https://status.cloud.google.com/",
        status_api_url="https://status.cloud.google.com/incidents.json",
        source_type="api",
    ),
]


def list_providers() -> list[Provider]:
    return PROVIDERS


def get_provider_by_name(provider_name: str) -> Provider | None:
    normalized_provider_name = provider_name.lower()

    for provider in PROVIDERS:
        if provider.name == normalized_provider_name:
            return provider

    return None
