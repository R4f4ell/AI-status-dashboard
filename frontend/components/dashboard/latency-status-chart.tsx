"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { ProviderStatusResponse } from "@/lib/types";
import { formatResponseTime, statusLabels } from "@/lib/status";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type LatencyStatusChartProps = {
  providers: ProviderStatusResponse[];
};

type ChartDataItem = {
  provider: string;
  displayName: string;
  responseTimeMs: number | null;
  statusLabel: string;
};

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: ChartDataItem;
  }>;
};

export function LatencyStatusChart({ providers }: LatencyStatusChartProps) {
  const chartData = providers.map((provider) => ({
    provider: provider.provider,
    displayName: provider.display_name,
    responseTimeMs: provider.response_time_ms,
    statusLabel: statusLabels[provider.status],
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Latência por provedor</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="displayName"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `${value} ms`}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="responseTimeMs"
                name="Latência"
                fill="var(--chart-2)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-md border bg-background px-3 py-2 text-sm shadow-sm">
      <div className="font-medium">{item.displayName}</div>
      <div className="text-muted-foreground">
        Latência: {formatResponseTime(item.responseTimeMs)}
      </div>
      <div className="text-muted-foreground">Status: {item.statusLabel}</div>
    </div>
  );
}
