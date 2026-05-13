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
      label: "Providers",
      value: summary.total_providers,
      detail: "Monitored services",
    },
    {
      label: "Operational",
      value: summary.operational,
      detail: "Healthy providers",
    },
    {
      label: "Issues",
      value:
        summary.degraded +
        summary.partial_outage +
        summary.major_outage +
        summary.unknown,
      detail: "Degraded, outage or unknown",
    },
    {
      label: "Avg latency",
      value: formatResponseTime(summary.average_response_time_ms),
      detail: `Checked ${formatDateTime(summary.checked_at)}`,
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
