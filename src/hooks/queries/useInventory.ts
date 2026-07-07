import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { InventoryAlerts, InventoryItem, PagedResult, StockMovement } from "../../api/types";

export function useInventoryItems(skip = 0, take = 25) {
  return useQuery({
    queryKey: ["inventory-items", skip, take],
    queryFn: () => apiFetch<PagedResult<InventoryItem>>(`/api/inventory-items?skip=${skip}&take=${take}`),
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

export function useStockMovements(itemId: string | null) {
  return useQuery({
    queryKey: ["stock-movements", itemId],
    queryFn: () => apiFetch<StockMovement[]>(`/api/inventory-items/${itemId}/stock-movements`),
    enabled: !!itemId,
  });
}
