import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type {
  CreateMedicalHistoryEntryRequest,
  MedicalHistoryEntry,
  Patient,
  PatientFormValues,
} from "../../api/types";

export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PatientFormValues) =>
      apiFetch<Patient>("/api/patients", {
        method: "POST",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useUpdatePatient(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: PatientFormValues & { isActive: boolean }) =>
      apiFetch<Patient>(`/api/patients/${id}`, {
        method: "PUT",
        body: JSON.stringify(values),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    },
  });
}

export function useAddMedicalHistoryEntry(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateMedicalHistoryEntryRequest) =>
      apiFetch<MedicalHistoryEntry>(`/api/patients/${patientId}/medical-history`, {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients", "detail", patientId] });
    },
  });
}
