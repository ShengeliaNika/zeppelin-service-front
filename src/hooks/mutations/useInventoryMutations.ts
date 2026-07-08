import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { CreateInventoryItemRequest, CreateStockMovementRequest, InventoryItem, StockMovement, UpdateInventoryItemRequest } from "../../api/types";

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
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
    },
  });
}

export function useUpdateInventoryItem(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpdateInventoryItemRequest) =>
      apiFetch<InventoryItem>(`/api/inventory-items/${id}`, {
        method: "PUT",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
    },
  });
}

export interface BulkAdjustmentLine {
  itemId: string;
  newQuantity: number;
  notes?: string;
}

export function useBulkAdjustment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lines: BulkAdjustmentLine[]) => {
      for (const line of lines) {
        await apiFetch<StockMovement>(`/api/inventory-items/${line.itemId}/stock-movements`, {
          method: "POST",
          body: JSON.stringify({ type: "Adjustment", quantity: line.newQuantity, notes: line.notes } satisfies CreateStockMovementRequest),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
    },
  });
}

export interface SupplyUsageLine {
  itemId: string;
  quantity: number;
  type: "UsageDeduction" | "Waste";
}

export function useLogSuppliesUsed(appointmentId: string, appointmentTypeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lines: SupplyUsageLine[]) => {
      for (const line of lines) {
        await apiFetch<StockMovement>(`/api/inventory-items/${line.itemId}/stock-movements`, {
          method: "POST",
          body: JSON.stringify({
            type: line.type,
            quantity: line.quantity,
            appointmentId,
            appointmentTypeId,
          } satisfies CreateStockMovementRequest),
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-supply-usage", appointmentId] });
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
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["stock-movements", itemId] });
    },
  });
}
