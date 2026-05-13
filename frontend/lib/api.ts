import type {
  Provider,
  ProviderStatusDetail,
  ProviderStatusResponse,
  StatusSummary,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000";

async function fetchApi<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function getProviders(): Promise<Provider[]> {
  return fetchApi<Provider[]>("/providers");
}

export function getSummary(): Promise<StatusSummary> {
  return fetchApi<StatusSummary>("/status/summary");
}

export function getProvidersStatus(): Promise<ProviderStatusResponse[]> {
  return fetchApi<ProviderStatusResponse[]>("/status/providers");
}

export function getProviderStatus(
  providerName: string,
): Promise<ProviderStatusDetail> {
  return fetchApi<ProviderStatusDetail>(`/status/providers/${providerName}`);
}
