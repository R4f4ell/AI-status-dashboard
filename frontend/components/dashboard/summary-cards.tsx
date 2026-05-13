import type { StatusSummary } from "@/lib/types";
import { formatDateTime, formatResponseTime } from "@/lib/status";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type SummaryCardsProps = {
  summary: StatusSummary;
};

export function SummaryCards({ summary }: SummaryCardsProps) {
  const cards = [
    {
      label: "Provedores",
      value: summary.total_providers,
      detail: "Serviços monitorados",
    },
    {
      label: "Operacionais",
      value: summary.operational,
      detail: "Provedores saudáveis",
    },
    {
      label: "Incidentes",
      value:
        summary.degraded +
        summary.partial_outage +
        summary.major_outage +
        summary.unknown,
      detail: "Instáveis, indisponíveis ou desconhecidos",
    },
    {
      label: "Latência média",
      value: formatResponseTime(summary.average_response_time_ms),
      detail: `Verificado em ${formatDateTime(summary.checked_at)}`,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardHeader>
            <CardTitle>{card.label}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{card.value}</div>
            <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
