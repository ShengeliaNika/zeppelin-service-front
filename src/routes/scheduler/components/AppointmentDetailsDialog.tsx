import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  TextField,
  Typography,
} from "@mui/material";
import type { Appointment, AppointmentStatus } from "../../../api/types";
import { useUpdateAppointmentStatus } from "../../../hooks/mutations/useAppointmentMutations";
import { StatusChip } from "../../../components/StatusChip";
import VisitNotesPanel from "./VisitNotesPanel";

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
}

const NEXT_STATUS: Partial<Record<AppointmentStatus, AppointmentStatus>> = {
  Scheduled: "Confirmed",
  Confirmed: "CheckedIn",
  CheckedIn: "Completed",
};

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export default function AppointmentDetailsDialog({ appointment, onClose }: Props) {
  const updateStatus = useUpdateAppointmentStatus();
  const [showNotes, setShowNotes] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  function advance() {
    const next = NEXT_STATUS[appointment.status];
    if (next) {
      updateStatus.mutate({ id: appointment.id, request: { status: next } });
    }
  }

  function confirmCancel() {
    if (cancelReason) {
      updateStatus.mutate({ id: appointment.id, request: { status: "Cancelled", cancelledReason: cancelReason } });
      setCancelling(false);
      onClose();
    }
  }

  return (
    <Dialog open onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{appointment.patientName}</DialogTitle>
      <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        <Typography color="text.secondary">
          {formatDate(appointment.startAtUtc)} · {formatTime(appointment.startAtUtc)} – {formatTime(appointment.endAtUtc)}
        </Typography>
        <Typography>
          {appointment.appointmentTypeName} · Dr. {appointment.dentistName}
          {appointment.chairName ? ` · ${appointment.chairName}` : ""}
        </Typography>
        {appointment.notes && (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "text.secondary" }}>
            {appointment.notes}
          </Typography>
        )}
        <Box>
          <StatusChip status={appointment.status} />
        </Box>

        {cancelling ? (
          <TextField
            autoFocus
            fullWidth
            label="Reason for cancellation"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        ) : (
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {NEXT_STATUS[appointment.status] && (
              <Button size="small" variant="outlined" onClick={advance} disabled={updateStatus.isPending}>
                Mark {NEXT_STATUS[appointment.status]}
              </Button>
            )}
            <Button size="small" onClick={() => setShowNotes((v) => !v)}>
              {showNotes ? "Hide Notes" : "Visit Notes"}
            </Button>
            {appointment.status !== "Completed" && appointment.status !== "Cancelled" && (
              <Button size="small" color="error" onClick={() => setCancelling(true)} disabled={updateStatus.isPending}>
                Cancel Appointment
              </Button>
            )}
          </Box>
        )}

        {showNotes && !cancelling && (
          <>
            <Divider />
            <VisitNotesPanel appointmentId={appointment.id} />
          </>
        )}
      </DialogContent>
      <DialogActions>
        {cancelling ? (
          <>
            <Button onClick={() => setCancelling(false)}>Back</Button>
            <Button color="error" variant="contained" disabled={!cancelReason} onClick={confirmCancel}>
              Confirm Cancellation
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Close</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
