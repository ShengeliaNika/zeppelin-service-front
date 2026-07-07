import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { CreateStaffUserRequest, StaffUser } from "../../api/types";

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateStaffUserRequest) =>
      apiFetch<StaffUser>("/api/users", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
  });
}
