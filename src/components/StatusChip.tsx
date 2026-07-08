import { Chip } from "@mui/material";

// Covers AppointmentStatus, TreatmentPlanItemStatus, and ToothStatus - one
// shared color map since none of them overlap in their string values.
const COLORS: Record<string, "success" | "error" | "warning" | "default" | "info"> = {
  // AppointmentStatus
  Scheduled: "info",
  Confirmed: "info",
  CheckedIn: "warning",
  Completed: "success",
  NoShow: "error",
  Cancelled: "error",
  // TeamTaskStatus
  Open: "default",
  // TreatmentPlanItemStatus / TreatmentPlanStatus
  Planned: "default",
  Draft: "default",
  InProgress: "warning",
  Active: "info",
  Done: "success",
  // ToothStatus
  Healthy: "success",
  Decayed: "error",
  Filled: "warning",
  Crowned: "warning",
  RootCanal: "error",
  Missing: "default",
  Implant: "info",
  Extracted: "default",
};

export function StatusChip({ status }: { status: string }) {
  return <Chip label={status} size="small" color={COLORS[status] ?? "default"} variant="outlined" />;
}
