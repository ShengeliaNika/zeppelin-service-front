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
import type { Appointment } from "../../../api/types";
import { useUpdateAppointmentStatus } from "../../../hooks/mutations/useAppointmentMutations";
import { StatusChip } from "../../../components/StatusChip";
import { formatDate, formatTime, NEXT_STATUS } from "../utils/appointmentFormat";
import VisitNotesPanel from "./VisitNotesPanel";
import SuppliesUsedPanel from "./SuppliesUsedPanel";

interface Props {
  appointment: Appointment;
  onClose: () => void;
}

export default function AppointmentDetailsDialog({ appointment, onClose }: Props) {
  const updateStatus = useUpdateAppointmentStatus();
  const [showNotes, setShowNotes] = useState(false);
  const [showSupplies, setShowSupplies] = useState(false);
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
    <Dialog open onClose={onClose} maxWidth="sm" fullWidth>
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
            <Button size="small" onClick={() => setShowSupplies((v) => !v)}>
              {showSupplies ? "Hide Supplies Used" : "Supplies Used"}
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

        {showSupplies && !cancelling && (
          <>
            <Divider />
            <SuppliesUsedPanel appointmentId={appointment.id} appointmentTypeId={appointment.appointmentTypeId} />
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
