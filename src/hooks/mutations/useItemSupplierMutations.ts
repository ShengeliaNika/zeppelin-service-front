import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { ItemSupplierLink, LinkItemSupplierRequest } from "../../api/types";

export function useLinkItemSupplier(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: LinkItemSupplierRequest) =>
      apiFetch<ItemSupplierLink>(`/api/inventory-items/${itemId}/suppliers`, {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", "detail", itemId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

export function useUnlinkItemSupplier(itemId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (linkId: string) =>
      apiFetch<void>(`/api/inventory-items/${itemId}/suppliers/${linkId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory-items", "detail", itemId] });
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
