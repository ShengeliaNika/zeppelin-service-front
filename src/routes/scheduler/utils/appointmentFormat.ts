import type { AppointmentStatus } from "../../../api/types";

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

export const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  Scheduled: "Confirmed",
  Confirmed: "CheckedIn",
  CheckedIn: "Completed",
};
