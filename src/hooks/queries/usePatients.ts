import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { PagedResult, Patient, PatientStatusCounts, PatientStatusFilter, PatientSearchBy, PatientSummary } from "../../api/types";

export function usePatients(
  search: string,
  skip = 0,
  take = 25,
  searchBy: PatientSearchBy = "name",
  status?: PatientStatusFilter,
) {
  return useQuery({
    queryKey: ["patients", search, skip, take, searchBy, status],
    queryFn: () => {
      const params = new URLSearchParams({ search, skip: String(skip), take: String(take), searchBy });
      if (status) params.set("status", status);
      return apiFetch<PagedResult<PatientSummary>>(`/api/patients?${params.toString()}`);
    },
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", "detail", id],
    queryFn: () => apiFetch<Patient>(`/api/patients/${id}`),
    enabled: !!id,
  });
}

export function usePatientStatusCounts() {
  return useQuery({
    queryKey: ["patients", "status-counts"],
    queryFn: () => apiFetch<PatientStatusCounts>("/api/patients/status-counts"),
  });
}
