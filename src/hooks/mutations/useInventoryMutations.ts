import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { CreateInventoryItemRequest, CreateStockMovementRequest, InventoryItem, StockMovement } from "../../api/types";

export function useCreateInventoryItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateInventoryItemRequest) =>
      apiFetch<InventoryItem>("/api/inventory-items", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
    },
  });
}

export function useRecordStockMovement(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateStockMovementRequest) =>
      apiFetch<StockMovement>(`/api/inventory-items/${itemId}/stock-movements`, {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", itemId] });
    },
  });
}
