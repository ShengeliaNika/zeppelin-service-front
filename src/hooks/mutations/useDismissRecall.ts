import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";

export function useDismissRecall() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      apiFetch<void>(`/api/alerts/recall/${id}/dismiss`, {
        method: "PUT",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["combined-alerts"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-summary"] });
    },
  });
}
