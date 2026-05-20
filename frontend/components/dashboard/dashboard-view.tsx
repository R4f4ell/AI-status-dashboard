"use client";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Gauge,
  RefreshCw,
  Server,
  ShieldCheck,
  WifiOff,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProviders, getProvidersStatus, getSummary } from "@/lib/api";
import {
  formatDateTime,
  formatResponseTime,
  sourceLabels,
  statusLabels,
  translateProviderMessage,
} from "@/lib/status";
import type {
  Provider,
  ProviderStatus,
  ProviderStatusResponse,
  StatusSummary,
} from "@/lib/types";
import { cn } from "@/lib/utils";

export function DashboardView() {
  const [isScrolled, setIsScrolled] = useState(false);

  const summaryQuery = useQuery({
    queryKey: ["status-summary"],
    queryFn: getSummary,
  });

  const providersQuery = useQuery({
    queryKey: ["status-providers"],
    queryFn: getProvidersStatus,
  });

  const providerLinksQuery = useQuery({
    queryKey: ["providers"],
    queryFn: getProviders,
  });

  const isInitialLoading = summaryQuery.isLoading || providersQuery.isLoading;
  const isRefreshing =
    summaryQuery.isFetching ||
    providersQuery.isFetching ||
    providerLinksQuery.isFetching;
  const hasError = summaryQuery.isError || providersQuery.isError;
  const summary = summaryQuery.data;
  const providers = providersQuery.data ?? [];
  const providerLinks = providerLinksQuery.data ?? [];

  const overallStatus = getOverallStatus(summary);

  useEffect(() => {
    const updateScrollState = () => {
      setIsScrolled(window.scrollY > 8);
    };

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const handleRefresh = () => {
    void summaryQuery.refetch();
    void providersQuery.refetch();
    void providerLinksQuery.refetch();
  };

  return (
    <div className="flex min-h-screen flex-col overflow-hidden">
      <DashboardHeader
        isScrolled={isScrolled}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 px-4 pb-10 pt-6 sm:px-6 lg:px-8">
        <HeroPanel
          status={overallStatus}
          checkedAt={summary?.checked_at}
          isLoading={isInitialLoading}
        />

        {hasError ? (
          <Alert variant="destructive" className="bg-card/80 backdrop-blur-xl">
            <WifiOff />
            <AlertTitle>Falha ao carregar dados do backend</AlertTitle>
            <AlertDescription>
              Verifique se a API FastAPI esta rodando em localhost:8000 e se o
              CORS permite a origem atual do front.
            </AlertDescription>
          </Alert>
        ) : null}

        <MetricsGrid summary={summary} isLoading={isInitialLoading} />

        <section className="grid gap-6">
          <ProvidersPanel
            providers={providers}
            providerLinks={providerLinks}
            isLoading={isInitialLoading}
          />
          <LatencyPanel providers={providers} isLoading={isInitialLoading} />
        </section>
      </main>
    </div>
  );
}

type DashboardHeaderProps = {
  isScrolled: boolean;
  isRefreshing: boolean;
  onRefresh: () => void;
};

function DashboardHeader({
  isScrolled,
  isRefreshing,
  onRefresh,
}: DashboardHeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-all duration-300",
        isScrolled
          ? "border-border/80 bg-background/80 shadow-sm backdrop-blur-2xl"
          : "border-transparent bg-background/40 backdrop-blur-xl",
      )}
    >
      <div className="mx-auto flex h-[68px] w-full max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-card/80 shadow-sm">
            <Activity />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground">
              AI Status Dashboard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="bg-card/70 backdrop-blur-xl"
          >
            <RefreshCw
              data-icon="inline-start"
              className={cn(isRefreshing && "animate-spin")}
            />
            Atualizar
          </Button>
        </div>
      </div>
    </header>
  );
}

type HeroPanelProps = {
  status: OverallStatus;
  checkedAt?: string;
  isLoading: boolean;
};

function HeroPanel({
  status,
  checkedAt,
  isLoading,
}: HeroPanelProps) {
  const StatusIcon = status.icon;

  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-3xl border bg-card/70 p-5 shadow-[0_24px_90px_rgba(0,0,0,0.28)] backdrop-blur-2xl md:p-8",
        status.panelClass,
      )}
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div
            className={cn(
              "flex w-fit items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
              status.badgeClass,
            )}
          >
            <span className={cn("size-2 rounded-full", status.dotClass)} />
            {status.badge}
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            <Clock3 />
            <span>Ultima checagem</span>
            <span className="font-mono text-foreground">
              {checkedAt ? formatDateTime(checkedAt) : "Aguardando dados"}
            </span>
          </div>
        </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
        <div className="flex flex-col gap-6">
          <div className="flex max-w-3xl flex-col gap-3">
            {isLoading ? (
              <>
                <Skeleton className="h-12 w-full max-w-xl" />
                <Skeleton className="h-5 w-full max-w-lg" />
              </>
            ) : (
              <>
                <h1 className="text-4xl font-semibold leading-tight text-foreground md:text-6xl">
                  {status.title}
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
                  {status.description}
                </p>
              </>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background/35 p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1">
              <span className="text-xs text-muted-foreground">
                Estado operacional
              </span>
              <span className="text-2xl font-semibold text-foreground">
                {isLoading ? "Carregando" : status.shortLabel}
              </span>
            </div>
            <div
              className={cn(
                "flex size-10 items-center justify-center rounded-2xl",
                status.iconClass,
              )}
            >
              <StatusIcon />
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
}

type MetricsGridProps = {
  summary?: StatusSummary;
  isLoading: boolean;
};

function MetricsGrid({ summary, isLoading }: MetricsGridProps) {
  const unstableProviders =
    (summary?.degraded ?? 0) + (summary?.partial_outage ?? 0);

  const metrics = [
    {
      label: "Provedores",
      value: summary?.total_providers ?? 0,
      detail: "Servicos monitorados",
      icon: Server,
    },
    {
      label: "Operacionais",
      value: summary?.operational ?? 0,
      detail:
        summary && summary.operational === summary.total_providers
          ? "Toda a base esta saudavel"
          : "Provedores sem incidente ativo",
      icon: ShieldCheck,
    },
    {
      label: "Instaveis",
      value: unstableProviders,
      detail:
        unstableProviders > 0
          ? "Exigem acompanhamento"
          : "Sem degradacao no momento",
      icon: AlertTriangle,
    },
    {
      label: "Latencia media",
      value: summary
        ? formatResponseTime(summary.average_response_time_ms)
        : "N/A",
      detail: "Tempo medio de resposta",
      icon: Gauge,
    },
  ];

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Card
            key={metric.label}
            className="border-border/80 bg-card/70 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-0.5"
          >
            <CardHeader>
              <CardTitle className="text-sm text-muted-foreground">
                {metric.label}
              </CardTitle>
              <CardAction>
                <div className="flex size-9 items-center justify-center rounded-xl border border-border bg-background/45 text-muted-foreground">
                  <Icon />
                </div>
              </CardAction>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-3xl font-semibold text-foreground">
                  {metric.value}
                </div>
              )}
              <p className="mt-2 text-sm text-muted-foreground">
                {metric.detail}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </section>
  );
}

type ProvidersPanelProps = {
  providers: ProviderStatusResponse[];
  providerLinks: Provider[];
  isLoading: boolean;
};

function ProvidersPanel({
  providers,
  providerLinks,
  isLoading,
}: ProvidersPanelProps) {
  const statusUrlsByProvider = useMemo(
    () =>
      new Map(
        providerLinks.map((provider) => [provider.name, provider.status_url]),
      ),
    [providerLinks],
  );

  return (
    <Card className="border-border/80 bg-card/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Provedores monitorados</CardTitle>
        <CardDescription>
          Clique em uma linha para abrir a pagina publica de status do provedor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ProvidersTableSkeleton />
        ) : providers.length ? (
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Provedor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Latencia</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Mensagem</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {providers.map((provider) => {
                const statusUrl = statusUrlsByProvider.get(provider.provider);

                return (
                  <TableRow
                    key={provider.provider}
                    tabIndex={statusUrl ? 0 : undefined}
                    role={statusUrl ? "button" : undefined}
                    className={cn(
                      statusUrl &&
                        "cursor-pointer focus-visible:bg-muted/50 focus-visible:outline-none",
                    )}
                    onClick={() => {
                      if (statusUrl) {
                        window.open(statusUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                    onKeyDown={(event) => {
                      if (
                        statusUrl &&
                        (event.key === "Enter" || event.key === " ")
                      ) {
                        event.preventDefault();
                        window.open(statusUrl, "_blank", "noopener,noreferrer");
                      }
                    }}
                  >
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <ProviderInitials name={provider.display_name} />
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="font-medium text-foreground">
                            {provider.display_name}
                          </span>
                          {statusUrl ? (
                            <ArrowUpRight className="text-muted-foreground" />
                          ) : null}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={provider.status} />
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {formatResponseTime(provider.response_time_ms)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="bg-background/50 text-muted-foreground"
                      >
                        {sourceLabels[provider.source]}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[420px]">
                      <span className="block truncate text-muted-foreground">
                        {getProviderMessage(provider)}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        ) : (
          <div className="flex min-h-48 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-background/35 text-center">
            <Server />
            <p className="text-sm font-medium">Nenhum provedor retornado</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              O backend respondeu sem itens para a lista de provedores.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

type LatencyPanelProps = {
  providers: ProviderStatusResponse[];
  isLoading: boolean;
};

function LatencyPanel({
  providers,
  isLoading,
}: LatencyPanelProps) {
  return (
    <Card className="border-border/80 bg-card/70 backdrop-blur-xl">
      <CardHeader>
        <CardTitle>Latencia por provedor</CardTitle>
        <CardDescription>
          Tempo de resposta medido pelo backend em cada consulta bem-sucedida.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <LatencyChart providers={providers} />
        )}
      </CardContent>
    </Card>
  );
}

function LatencyChart({ providers }: { providers: ProviderStatusResponse[] }) {
  const chartData = useMemo(
    () =>
      providers
        .filter((provider) => provider.response_time_ms !== null)
        .map((provider) => ({
          provider: provider.provider,
          displayName: provider.display_name,
          responseTimeMs: provider.response_time_ms ?? 0,
          statusLabel: statusLabels[provider.status],
        })),
    [providers],
  );
  const maxResponseTime = Math.max(
    ...chartData.map((provider) => provider.responseTimeMs),
    0,
  );
  const axisMax = getLatencyAxisMax(maxResponseTime);
  const axisTicks = getLatencyAxisTicks(axisMax);

  if (!chartData.length) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border border-dashed border-border bg-background/35 px-6 text-center text-sm text-muted-foreground">
        Nenhuma latencia foi retornada nas consultas atuais. Quando o backend
        conseguir medir os provedores externos, o grafico sera preenchido.
      </div>
    );
  }

  return (
    <div className="h-80 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 12, left: 8 }}>
          <CartesianGrid
            stroke="var(--border)"
            strokeDasharray="4 4"
            vertical={false}
          />
          <XAxis
            dataKey="displayName"
            tickLine={false}
            axisLine={false}
            tickMargin={10}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <YAxis
            width={58}
            allowDecimals={false}
            domain={[0, axisMax]}
            ticks={axisTicks}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            tickFormatter={(value) => `${Math.round(Number(value))} ms`}
          />
          <Tooltip
            cursor={{ fill: "var(--muted)" }}
            content={<ChartTooltip />}
          />
          <Bar
            dataKey="responseTimeMs"
            name="Latencia"
            fill="var(--primary)"
            radius={[10, 10, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type ChartTooltipProps = {
  active?: boolean;
  payload?: Array<{
    payload: {
      displayName: string;
      responseTimeMs: number;
      statusLabel: string;
    };
  }>;
};

function ChartTooltip({ active, payload }: ChartTooltipProps) {
  if (!active || !payload?.length) {
    return null;
  }

  const item = payload[0].payload;

  return (
    <div className="rounded-xl border border-border bg-popover px-3 py-2 text-sm text-popover-foreground shadow-xl">
      <div className="font-medium">{item.displayName}</div>
      <div className="text-muted-foreground">
        Latencia: {formatResponseTime(item.responseTimeMs)}
      </div>
      <div className="text-muted-foreground">Status: {item.statusLabel}</div>
    </div>
  );
}

function ProvidersTableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="grid grid-cols-[1.4fr_0.8fr_0.7fr_0.7fr_1.6fr] items-center gap-4 rounded-xl border border-border bg-background/30 p-3"
        >
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  );
}

function ProviderInitials({ name }: { name: string }) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/60 text-sm font-semibold text-foreground">
      {name
        .split(" ")
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase()}
    </div>
  );
}

function StatusBadge({ status }: { status: ProviderStatus }) {
  return (
    <Badge variant={getBadgeVariant(status)} className={getBadgeClass(status)}>
      <span className={cn("size-1.5 rounded-full", getStatusDotClass(status))} />
      {statusLabels[status]}
    </Badge>
  );
}

type OverallStatus = {
  badge: string;
  title: string;
  description: string;
  shortLabel: string;
  icon: typeof CheckCircle2;
  dotClass: string;
  badgeClass: string;
  iconClass: string;
  panelClass: string;
};

function getOverallStatus(summary?: StatusSummary): OverallStatus {
  if (!summary) {
    return {
      badge: "Sincronizando",
      title: "Carregando status dos sistemas",
      description: "Aguardando a primeira leitura dos endpoints do backend.",
      shortLabel: "Carregando",
      icon: Activity,
      dotClass: "bg-muted-foreground",
      badgeClass: "border-border bg-background/55 text-muted-foreground",
      iconClass: "bg-muted text-muted-foreground",
      panelClass: "border-border",
    };
  }

  if (summary.major_outage > 0) {
    return {
      badge: "Incidente critico",
      title: "Incidente critico detectado",
      description:
        "Um ou mais provedores retornaram indisponibilidade relevante. Priorize a verificacao da tabela para abrir a pagina oficial de status.",
      shortLabel: "Critico",
      icon: AlertTriangle,
      dotClass: "bg-destructive",
      badgeClass: "border-destructive/30 bg-destructive/10 text-destructive",
      iconClass: "bg-destructive/10 text-destructive",
      panelClass: "border-destructive/35",
    };
  }

  if (summary.partial_outage > 0 || summary.degraded > 0) {
    return {
      badge: "Atencao operacional",
      title: "Alguns provedores apresentam instabilidade",
      description:
        "O monitoramento encontrou degradacao ou impacto parcial. Acompanhe os provedores afetados e valide a comunicacao oficial de cada servico.",
      shortLabel: "Instavel",
      icon: Gauge,
      dotClass: "bg-amber-400",
      badgeClass: "border-amber-400/30 bg-amber-400/10 text-amber-300",
      iconClass: "bg-amber-400/10 text-amber-300",
      panelClass: "border-amber-400/35",
    };
  }

  if (summary.unknown > 0) {
    return {
      badge: "Status incompleto",
      title: "Alguns provedores nao puderam ser verificados",
      description:
        "A API respondeu, mas parte das consultas externas nao retornou dados conclusivos. Isso pode indicar bloqueio de rede, timeout ou resposta invalida do provedor.",
      shortLabel: "Incompleto",
      icon: WifiOff,
      dotClass: "bg-muted-foreground",
      badgeClass: "border-border bg-background/55 text-muted-foreground",
      iconClass: "bg-muted text-muted-foreground",
      panelClass: "border-border",
    };
  }

  return {
    badge: "Operacao estavel",
    title: "Todos os provedores operam normalmente",
    description:
      "Nenhum incidente ativo foi detectado na ultima leitura. As metricas abaixo refletem os dados normalizados pelo backend.",
    shortLabel: "Operacional",
    icon: CheckCircle2,
    dotClass: "bg-primary",
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
    iconClass: "bg-primary/10 text-primary",
    panelClass: "border-primary/35",
  };
}

function getLatencyAxisMax(maxValue: number) {
  if (maxValue <= 0) {
    return 100;
  }

  const roughStep = maxValue / 4;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / magnitude;
  const stepMultiplier =
    normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const step = stepMultiplier * magnitude;

  return Math.ceil(maxValue / step) * step;
}

function getLatencyAxisTicks(axisMax: number) {
  const step = axisMax / 4;

  return Array.from({ length: 5 }, (_, index) => Math.round(step * index));
}

function getBadgeVariant(status: ProviderStatus) {
  if (status === "operational") {
    return "secondary";
  }

  if (status === "unknown") {
    return "outline";
  }

  return "destructive";
}

function getBadgeClass(status: ProviderStatus) {
  if (status === "operational") {
    return "border-primary/20 bg-primary/10 text-primary";
  }

  if (status === "degraded" || status === "partial_outage") {
    return "border-amber-400/20 bg-amber-400/10 text-amber-300";
  }

  if (status === "major_outage") {
    return "border-destructive/20 bg-destructive/10 text-destructive";
  }

  return "bg-background/50 text-muted-foreground";
}

function getProviderMessage(provider: ProviderStatusResponse) {
  if (provider.status === "operational") {
    return "Operacao normal confirmada na ultima leitura.";
  }

  if (provider.status === "degraded") {
    return "Degradacao detectada. Recomendado acompanhar a pagina oficial.";
  }

  if (provider.status === "partial_outage") {
    return "Impacto parcial detectado. Verifique detalhes no status oficial.";
  }

  if (provider.status === "major_outage") {
    return "Indisponibilidade critica detectada. Validar comunicacao oficial.";
  }

  return translateProviderMessage(provider.message);
}

function getStatusDotClass(status: ProviderStatus) {
  if (status === "operational") {
    return "bg-primary";
  }

  if (status === "degraded" || status === "partial_outage") {
    return "bg-amber-400";
  }

  if (status === "major_outage") {
    return "bg-destructive";
  }

  return "bg-muted-foreground";
}
