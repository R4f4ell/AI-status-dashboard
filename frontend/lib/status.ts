import type { ProviderSource, ProviderStatus } from "./types";

export const statusLabels: Record<ProviderStatus, string> = {
  operational: "Operacional",
  degraded: "Instável",
  partial_outage: "Instabilidade parcial",
  major_outage: "Incidente crítico",
  unknown: "Desconhecido",
};

export const sourceLabels: Record<ProviderSource, string> = {
  api: "API",
  scraping: "Scraping",
  mock: "Simulado",
};

const messageLabels: Record<string, string> = {
  "All Systems Operational": "Todos os sistemas operacionais",
  "We are fully operational": "Serviço totalmente operacional",
  "No active broad Google Cloud incidents":
    "Nenhum incidente ativo amplo no Google Cloud",
};

export function formatResponseTime(responseTimeMs: number | null): string {
  if (responseTimeMs === null) {
    return "N/A";
  }

  return `${responseTimeMs} ms`;
}

export function formatDateTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function translateProviderMessage(message: string): string {
  return messageLabels[message] ?? message;
}
