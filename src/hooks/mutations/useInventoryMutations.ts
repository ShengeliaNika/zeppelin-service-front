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
      // Broad match (no exact queryKey) so the "My Patients" list's Pending/Logged
      // badge (which reads Appointment.hasLoggedSupplies) refreshes too.
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

// Undoes a mistaken "supplies used" line - restores the stock it deducted
// rather than just deleting the row (see the backend's ReverseUsageMovementAsync).
// Correction flow is delete-then-re-add via the existing add form, not in-place edit.
export function useDeleteSupplyUsage(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, movementId }: { itemId: string; movementId: string }) =>
      apiFetch<void>(`/api/inventory-items/${itemId}/stock-movements/${movementId}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["inventory-summary"] });
      queryClient.invalidateQueries({ queryKey: ["appointment-supply-usage", appointmentId] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
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
