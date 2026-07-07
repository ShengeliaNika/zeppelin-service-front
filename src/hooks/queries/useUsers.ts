import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { StaffUser } from "../../api/types";

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: () => apiFetch<StaffUser[]>("/api/users"),
  });
}
