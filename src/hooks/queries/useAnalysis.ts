import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { AppointmentsTrend, PatientGrowth, RevenueTrend } from "../../api/types";

export function useAppointmentsTrend(from: string, to: string) {
  return useQuery({
    queryKey: ["analysis-appointments-trend", from, to],
    queryFn: () => apiFetch<AppointmentsTrend>(`/api/analysis/appointments-trend?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  });
}

export function usePatientGrowth(from: string, to: string) {
  return useQuery({
    queryKey: ["analysis-patient-growth", from, to],
    queryFn: () => apiFetch<PatientGrowth>(`/api/analysis/patient-growth?from=${from}&to=${to}`),
    enabled: !!from && !!to,
  });
}

export function useRevenueTrend(months = 6) {
  return useQuery({
    queryKey: ["analysis-revenue-trend", months],
    queryFn: () => apiFetch<RevenueTrend>(`/api/analysis/revenue-trend?months=${months}`),
  });
}
