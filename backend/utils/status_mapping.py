import html
import re
from typing import Any

from schemas.status import ProviderStatus


STATUSPAGE_INDICATORS: dict[str, ProviderStatus] = {
    "none": "operational",
    "minor": "degraded",
    "major": "partial_outage",
    "critical": "major_outage",
}

INSTATUS_STATUSES: dict[str, ProviderStatus] = {
    "up": "operational",
    "hasissues": "degraded",
    "undermaintenance": "degraded",
    "operational": "operational",
    "under_maintenance": "degraded",
    "degraded_performance": "degraded",
    "partial_outage": "partial_outage",
    "major_outage": "major_outage",
}

COMPONENT_STATUSES: dict[str, ProviderStatus] = {
    "operational": "operational",
    "degraded_performance": "degraded",
    "partial_outage": "partial_outage",
    "major_outage": "major_outage",
}

COMPONENT_STATUS_PRIORITY: dict[ProviderStatus, int] = {
    "operational": 0,
    "degraded": 1,
    "partial_outage": 2,
    "major_outage": 3,
    "unknown": 4,
}


def normalize_provider_status(data: Any) -> tuple[ProviderStatus, str]:
    if isinstance(data, list):
        return normalize_google_cloud_incidents(data)

    if not isinstance(data, dict):
        return "unknown", "Provider response format is not supported"

    status = data.get("status")

    if isinstance(status, dict):
        indicator = str(status.get("indicator", "")).lower()
        description = str(status.get("description") or "Status received")
        return STATUSPAGE_INDICATORS.get(indicator, "unknown"), description

    page = data.get("page")
    if isinstance(page, dict):
        page_status = str(page.get("status", "")).lower()
        description = str(
            page.get("status_description") or page.get("status") or "Status received"
        )
        return INSTATUS_STATUSES.get(page_status, "unknown"), description

    components = data.get("components")
    if isinstance(components, list):
        return normalize_components_status(components)

    return "unknown", "Provider response format is not supported"


def normalize_scraped_provider_status(
    provider_name: str,
    content: str,
) -> tuple[ProviderStatus, str]:
    normalized_content = normalize_html_text(content)

    if provider_name == "openai":
        return normalize_openai_status(normalized_content)

    if provider_name == "railway":
        return normalize_railway_status(normalized_content)

    return "unknown", "Provider scraping is not supported"


def normalize_html_text(content: str) -> str:
    text = re.sub(r"<script.*?</script>", " ", content, flags=re.DOTALL)
    text = re.sub(r"<style.*?</style>", " ", text, flags=re.DOTALL)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html.unescape(text)
    return re.sub(r"\s+", " ", text).strip().lower()


def normalize_openai_status(content: str) -> tuple[ProviderStatus, str]:
    if "fully operational" in content:
        return "operational", "We are fully operational"

    if "not aware of any issues" in content:
        return "operational", "No issues affecting systems"

    return normalize_status_from_text(content)


def normalize_railway_status(content: str) -> tuple[ProviderStatus, str]:
    if (
        "all systems operational" in content
        or "fully operational" in content
        or "not aware of any issues affecting our systems" in content
    ):
        return "operational", "We are fully operational"

    return normalize_status_from_text(content)


def normalize_status_from_text(content: str) -> tuple[ProviderStatus, str]:
    if "major outage" in content or "service outage" in content:
        return "major_outage", "Status page reports a major outage"

    if "partial outage" in content or "service disruption" in content:
        return "partial_outage", "Status page reports a partial outage"

    if "degraded" in content or "has issues" in content:
        return "degraded", "Status page reports degraded performance"

    return "unknown", "Status page content could not be normalized"


def normalize_google_cloud_incidents(
    incidents: list[Any],
) -> tuple[ProviderStatus, str]:
    active_incidents = [
        incident
        for incident in incidents
        if isinstance(incident, dict) and not incident.get("end")
    ]

    if not active_incidents:
        return "operational", "No active broad Google Cloud incidents"

    statuses = [
        normalize_google_cloud_incident_status(incident)
        for incident in active_incidents
    ]
    status = max(statuses, key=lambda item: COMPONENT_STATUS_PRIORITY[item])
    incident = active_incidents[0]
    description = str(
        incident.get("external_desc")
        or incident.get("service_name")
        or "Active Google Cloud incident"
    )

    return status, description


def normalize_google_cloud_incident_status(
    incident: dict[str, Any],
) -> ProviderStatus:
    status_impact = str(incident.get("status_impact", "")).upper()
    severity = str(incident.get("severity", "")).lower()

    if status_impact == "SERVICE_OUTAGE" or severity == "high":
        return "major_outage"

    if status_impact == "SERVICE_DISRUPTION":
        return "partial_outage"

    if status_impact == "SERVICE_INFORMATION" or severity in {"low", "medium"}:
        return "degraded"

    return "unknown"


def normalize_components_status(
    components: list[dict[str, Any]],
) -> tuple[ProviderStatus, str]:
    if not components:
        return "unknown", "Provider returned no components"

    statuses = [
        COMPONENT_STATUSES.get(str(component.get("status", "")).lower(), "unknown")
        for component in components
        if isinstance(component, dict)
    ]

    if not statuses:
        return "unknown", "Provider returned invalid components"

    status = max(statuses, key=lambda item: COMPONENT_STATUS_PRIORITY[item])

    if status == "operational":
        return status, "All components operational"

    affected_components = [
        str(component.get("name"))
        for component in components
        if isinstance(component, dict)
        and COMPONENT_STATUSES.get(
            str(component.get("status", "")).lower(),
            "unknown",
        )
        == status
    ]

    if affected_components:
        return status, f"Affected components: {', '.join(affected_components[:3])}"

    return status, "Component status received"
