import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type {
  AdjustmentLogEntry,
  AppointmentSupplyUsage,
  InventoryAlerts,
  InventoryCategory,
  InventoryItem,
  InventorySummary,
  PagedResult,
  StockMovement,
} from "../../api/types";

export type InventoryQuickFilter = "" | "lowStock" | "nearExpiry" | "negativeMargin";

export function useInventoryItems(skip = 0, take = 25, category?: InventoryCategory | "", search?: string, quickFilter?: InventoryQuickFilter) {
  return useQuery({
    queryKey: ["inventory-items", skip, take, category, search, quickFilter],
    queryFn: () => {
      const params = new URLSearchParams({ skip: String(skip), take: String(take) });
      if (category) params.set("category", category);
      if (search) params.set("search", search);
      if (quickFilter) params.set("quickFilter", quickFilter);
      return apiFetch<PagedResult<InventoryItem>>(`/api/inventory-items?${params.toString()}`);
    },
  });
}

export function useInventoryItem(id: string | undefined) {
  return useQuery({
    queryKey: ["inventory-items", "detail", id],
    queryFn: () => apiFetch<InventoryItem>(`/api/inventory-items/${id}`),
    enabled: !!id,
  });
}

export function useInventoryAlerts() {
  return useQuery({
    queryKey: ["inventory-alerts"],
    queryFn: () => apiFetch<InventoryAlerts>("/api/inventory-items/alerts"),
  });
}

export function useInventorySummary() {
  return useQuery({
    queryKey: ["inventory-summary"],
    queryFn: () => apiFetch<InventorySummary>("/api/inventory-items/summary"),
  });
}

export function useStockMovements(itemId: string | null) {
  return useQuery({
    queryKey: ["stock-movements", itemId],
    queryFn: () => apiFetch<StockMovement[]>(`/api/inventory-items/${itemId}/stock-movements`),
    enabled: !!itemId,
  });
}

export function useAppointmentSupplyUsage(appointmentId: string) {
  return useQuery({
    queryKey: ["appointment-supply-usage", appointmentId],
    queryFn: () => apiFetch<AppointmentSupplyUsage[]>(`/api/appointments/${appointmentId}/stock-movements`),
  });
}

export function useAdjustments(take = 20) {
  return useQuery({
    queryKey: ["inventory-adjustments", take],
    queryFn: () => apiFetch<AdjustmentLogEntry[]>(`/api/inventory-items/adjustments?take=${take}`),
  });
}
