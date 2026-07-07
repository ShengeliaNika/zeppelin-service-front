import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "../../api/client";
import type {
  Attachment,
  AttachmentType,
  CreateTreatmentPlanRequest,
  CreateVisitNoteRequest,
  ToothRecord,
  TreatmentPlan,
  TreatmentPlanItem,
  UpdateTreatmentPlanItemRequest,
  UpsertToothRecordRequest,
  VisitNote,
} from "../../api/types";

export function useUpsertToothRecord(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: UpsertToothRecordRequest) =>
      apiFetch<ToothRecord>(`/api/patients/${patientId}/tooth-records`, {
        method: "PUT",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tooth-records", patientId] });
    },
  });
}

export function useCreateTreatmentPlan(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTreatmentPlanRequest) =>
      apiFetch<TreatmentPlan>(`/api/patients/${patientId}/treatment-plans`, {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
    },
  });
}

export function useUpdateTreatmentPlanItem(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ itemId, request }: { itemId: string; request: UpdateTreatmentPlanItemRequest }) =>
      apiFetch<TreatmentPlanItem>(`/api/treatment-plan-items/${itemId}`, {
        method: "PUT",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["treatment-plans", patientId] });
    },
  });
}

export function useUploadAttachment(patientId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ file, type }: { file: File; type: AttachmentType }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", type);
      return apiFetch<Attachment>(`/api/patients/${patientId}/attachments`, {
        method: "POST",
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attachments", patientId] });
    },
  });
}

export function useCreateVisitNote(appointmentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateVisitNoteRequest) =>
      apiFetch<VisitNote>(`/api/appointments/${appointmentId}/visit-notes`, {
        method: "POST",
        body: JSON.stringify(request),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visit-notes", appointmentId] });
    },
  });
}
