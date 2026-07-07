import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type {
  Appointment,
  CreateAppointmentRequest,
  RescheduleAppointmentRequest,
  UpdateAppointmentStatusRequest,
} from "../../api/types";

export function useCreateAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateAppointmentRequest) =>
      apiFetch<Appointment>("/api/appointments", {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useRescheduleAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: RescheduleAppointmentRequest }) =>
      apiFetch<Appointment>(`/api/appointments/${id}`, {
        method: "PUT",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateAppointmentStatusRequest }) =>
      apiFetch<Appointment>(`/api/appointments/${id}/status`, {
        method: "PUT",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
    },
  });
}
