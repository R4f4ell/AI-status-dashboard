import { DashboardView } from "@/components/dashboard/dashboard-view";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-8 px-6 py-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Status Dashboard
        </h1>
        <p className="text-sm text-muted-foreground">
          Monitoramento de serviços de IA e APIs públicas a partir do back-end
          FastAPI.
        </p>
      </header>
      <DashboardView />
    </main>
  );
}
