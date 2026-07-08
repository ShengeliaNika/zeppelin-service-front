import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { TeamTask, TeamTaskStatus } from "../../api/types";

export function useTeamTasks(mine: boolean, status?: TeamTaskStatus | "") {
  return useQuery({
    queryKey: ["team-tasks", mine, status],
    queryFn: () => {
      const params = new URLSearchParams({ mine: String(mine) });
      if (status) params.set("status", status);
      return apiFetch<TeamTask[]>(`/api/team-tasks?${params.toString()}`);
    },
  });
}
