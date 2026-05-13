export type ProviderSource = "api" | "scraping" | "mock";

export type ProviderStatus =
  | "operational"
  | "degraded"
  | "partial_outage"
  | "major_outage"
  | "unknown";

export type Provider = {
  name: string;
  display_name: string;
  status_url: string;
  source_type: ProviderSource;
};

export type ProviderStatusResponse = {
  provider: string;
  display_name: string;
  status: ProviderStatus;
  response_time_ms: number | null;
  checked_at: string;
  message: string;
  source: ProviderSource;
};

export type StatusHistoryItem = {
  provider: string;
  status: ProviderStatus;
  response_time_ms: number | null;
  checked_at: string;
  message: string;
};

export type ProviderStatusDetail = {
  current: ProviderStatusResponse;
  history: StatusHistoryItem[];
};

export type StatusSummary = {
  total_providers: number;
  operational: number;
  degraded: number;
  partial_outage: number;
  major_outage: number;
  unknown: number;
  average_response_time_ms: number | null;
  checked_at: string;
};
