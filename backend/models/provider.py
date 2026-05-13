from dataclasses import dataclass


@dataclass(frozen=True)
class Provider:
    name: str
    display_name: str
    status_url: str
    status_api_url: str
    source_type: str
