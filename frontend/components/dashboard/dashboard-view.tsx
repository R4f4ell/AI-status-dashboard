"use client";

import { useQuery } from "@tanstack/react-query";

import { getProvidersStatus, getSummary } from "@/lib/api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SummaryCards } from "./summary-cards";
import { ProvidersTable } from "./providers-table";

export function DashboardView() {
  const summaryQuery = useQuery({
    queryKey: ["status-summary"],
    queryFn: getSummary,
  });

  const providersQuery = useQuery({
    queryKey: ["providers-status"],
    queryFn: getProvidersStatus,
  });

  if (summaryQuery.isLoading || providersQuery.isLoading) {
    return <DashboardLoading />;
  }

  if (summaryQuery.isError || providersQuery.isError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Unable to load dashboard</AlertTitle>
        <AlertDescription>
          Check if the FastAPI server is running on port 8000.
        </AlertDescription>
      </Alert>
    );
  }

  if (!summaryQuery.data || !providersQuery.data?.length) {
    return (
      <Alert>
        <AlertTitle>No provider data</AlertTitle>
        <AlertDescription>
          The API responded successfully, but no provider status was returned.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <SummaryCards summary={summaryQuery.data} />
      <Card>
        <CardHeader>
          <CardTitle>Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <ProvidersTable providers={providersQuery.data} />
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardLoading() {
  return (
    <div className="flex flex-col gap-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-8 w-20" />
              <Skeleton className="mt-3 h-4 w-36" />
            </CardContent>
          </Card>
        ))}
      </section>
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}
