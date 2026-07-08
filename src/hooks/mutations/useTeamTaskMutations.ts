import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { CreateTeamTaskRequest, TeamTask, TeamTaskStatus } from "../../api/types";

export function useCreateTeamTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTeamTaskRequest) =>
      apiFetch<TeamTask>("/api/team-tasks", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-tasks"] });
    },
  });
}

export function useUpdateTeamTaskStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: TeamTaskStatus }) =>
      apiFetch<TeamTask>(`/api/team-tasks/${id}/status`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-tasks"] });
    },
  });
}
