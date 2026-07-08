import { useQuery } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type { Attachment, TreatmentPlan, ToothRecord, VisitNote } from "../../api/types";

export function useToothRecords(patientId: string) {
  return useQuery({
    queryKey: ["tooth-records", patientId],
    queryFn: () => apiFetch<ToothRecord[]>(`/api/patients/${patientId}/tooth-records`),
  });
}

export function useTreatmentPlans(patientId: string) {
  return useQuery({
    queryKey: ["treatment-plans", patientId],
    queryFn: () => apiFetch<TreatmentPlan[]>(`/api/patients/${patientId}/treatment-plans`),
  });
}

export function useAttachments(patientId: string) {
  return useQuery({
    queryKey: ["attachments", patientId],
    queryFn: () => apiFetch<Attachment[]>(`/api/patients/${patientId}/attachments`),
  });
}

export function useVisitNotes(appointmentId: string | null) {
  return useQuery({
    queryKey: ["visit-notes", appointmentId],
    queryFn: () => apiFetch<VisitNote[]>(`/api/appointments/${appointmentId}/visit-notes`),
    enabled: !!appointmentId,
  });
}

export function usePatientVisitNotes(patientId: string) {
  return useQuery({
    queryKey: ["visit-notes", "by-patient", patientId],
    queryFn: () => apiFetch<VisitNote[]>(`/api/patients/${patientId}/visit-notes`),
  });
}
