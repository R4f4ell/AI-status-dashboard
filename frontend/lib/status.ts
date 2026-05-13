import type { ProviderSource, ProviderStatus } from "./types";

export const statusLabels: Record<ProviderStatus, string> = {
  operational: "Operational",
  degraded: "Degraded",
  partial_outage: "Partial outage",
  major_outage: "Major outage",
  unknown: "Unknown",
};

export const sourceLabels: Record<ProviderSource, string> = {
  api: "API",
  scraping: "Scraping",
  mock: "Mock",
};

export function formatResponseTime(responseTimeMs: number | null): string {
  if (responseTimeMs === null) {
    return "N/A";
  }

  return `${responseTimeMs} ms`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}
