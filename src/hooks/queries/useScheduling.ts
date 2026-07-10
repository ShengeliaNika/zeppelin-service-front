import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { Appointment, AppointmentType, Chair, StaffDirectoryEntry } from "../../api/types";

export function useAppointmentTypes() {
  return useQuery({
    queryKey: ["appointment-types"],
    queryFn: () => apiFetch<AppointmentType[]>("/api/appointment-types"),
  });
}

export function useChairs() {
  return useQuery({
    queryKey: ["chairs"],
    queryFn: () => apiFetch<Chair[]>("/api/chairs"),
  });
}

export function useStaffDirectory() {
  return useQuery({
    queryKey: ["staff"],
    queryFn: () => apiFetch<StaffDirectoryEntry[]>("/api/staff"),
  });
}

export function useAppointments(fromIso: string, toIso: string) {
  return useQuery({
    queryKey: ["appointments", fromIso, toIso],
    queryFn: () => apiFetch<Appointment[]>(`/api/appointments?from=${fromIso}&to=${toIso}`),
  });
}

export function usePatientAppointments(patientId: string) {
  return useQuery({
    queryKey: ["appointments", "by-patient", patientId],
    queryFn: () => apiFetch<Appointment[]>(`/api/appointments?patientId=${patientId}`),
  });
}

export function useMyCompletedAppointments(dentistUserId: string | undefined) {
  return useQuery({
    queryKey: ["appointments", "completed", dentistUserId],
    queryFn: () => apiFetch<Appointment[]>(`/api/appointments?dentistUserId=${dentistUserId}&status=Completed`),
    enabled: !!dentistUserId,
  });
}
