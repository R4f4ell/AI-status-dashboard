import type { ProviderStatusResponse } from "@/lib/types";
import {
  formatDateTime,
  formatResponseTime,
  sourceLabels,
  statusLabels,
  translateProviderMessage,
} from "@/lib/status";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ProvidersTableProps = {
  providers: ProviderStatusResponse[];
};

export function ProvidersTable({ providers }: ProvidersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Provedor</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Latência</TableHead>
          <TableHead>Fonte</TableHead>
          <TableHead>Última verificação</TableHead>
          <TableHead>Mensagem</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {providers.map((provider) => (
          <TableRow key={provider.provider}>
            <TableCell className="font-medium">
              {provider.display_name}
            </TableCell>
            <TableCell>
              <Badge variant={getStatusVariant(provider.status)}>
                {statusLabels[provider.status]}
              </Badge>
            </TableCell>
            <TableCell>{formatResponseTime(provider.response_time_ms)}</TableCell>
            <TableCell>{sourceLabels[provider.source]}</TableCell>
            <TableCell>{formatDateTime(provider.checked_at)}</TableCell>
            <TableCell className="max-w-80 truncate">
              {translateProviderMessage(provider.message)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function getStatusVariant(status: ProviderStatusResponse["status"]) {
  if (status === "operational") {
    return "secondary";
  }

  if (status === "unknown") {
    return "outline";
  }

  return "destructive";
}
