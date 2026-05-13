from pydantic import BaseModel


class ProviderResponse(BaseModel):
    name: str
    display_name: str
    status_url: str
    source_type: str
