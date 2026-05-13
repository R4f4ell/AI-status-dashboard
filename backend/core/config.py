from dataclasses import dataclass


@dataclass(frozen=True)
class Settings:
    app_name: str = "AI Status Dashboard API"
    frontend_origin: str = "http://localhost:3000"
    api_timeout_seconds: float = 8
    cache_ttl_seconds: int = 60
    history_limit_per_provider: int = 50


settings = Settings()
