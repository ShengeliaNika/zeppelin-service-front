import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { PagedResult, Patient, PatientSummary } from "../../api/types";

export function usePatients(search: string, skip = 0, take = 25) {
  return useQuery({
    queryKey: ["patients", search, skip, take],
    queryFn: () =>
      apiFetch<PagedResult<PatientSummary>>(
        `/api/patients?search=${encodeURIComponent(search)}&skip=${skip}&take=${take}`,
      ),
  });
}

export function usePatient(id: string | undefined) {
  return useQuery({
    queryKey: ["patients", "detail", id],
    queryFn: () => apiFetch<Patient>(`/api/patients/${id}`),
    enabled: !!id,
  });
}
