import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { InventoryCategory, UsageCostReport } from "../../api/types";

export function useUsageCostReport(from: string, to: string, category?: InventoryCategory | "") {
  return useQuery({
    queryKey: ["usage-cost-report", from, to, category],
    queryFn: () => {
      const params = new URLSearchParams({ from, to });
      if (category) params.set("category", category);
      return apiFetch<UsageCostReport>(`/api/inventory-reports/usage-cost?${params.toString()}`);
    },
    enabled: !!from && !!to,
  });
}
