import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { AuditLogEntry, CombinedAlerts, DashboardSummary, PagedResult } from "../../api/types";

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: () => apiFetch<DashboardSummary>("/api/dashboard"),
  });
}

export function useCombinedAlerts() {
  return useQuery({
    queryKey: ["combined-alerts"],
    queryFn: () => apiFetch<CombinedAlerts>("/api/alerts"),
  });
}

export function useAuditLog(entityName: string | undefined, skip: number, take: number) {
  return useQuery({
    queryKey: ["audit-log", entityName, skip, take],
    queryFn: () => {
      const params = new URLSearchParams({ skip: String(skip), take: String(take) });
      if (entityName) params.set("entityName", entityName);
      return apiFetch<PagedResult<AuditLogEntry>>(`/api/audit-log?${params.toString()}`);
    },
  });
}
