import { Box, Button, ClickAwayListener, Paper, Popper, Typography } from "@mui/material";
import type { Appointment } from "../../../api/types";
import { useUpdateAppointmentStatus } from "../../../hooks/mutations/useAppointmentMutations";
import { StatusChip } from "../../../components/StatusChip";
import { formatDate, formatTime, NEXT_STATUS } from "../utils/appointmentFormat";

interface Props {
  appointment: Appointment;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onViewDetails: () => void;
}

// Quick-glance popover for a single click, mirroring Google Calendar's own
// two-tier behavior (quick popover -> full event view) rather than cramming
// AppointmentDetailsDialog's status/cancel/notes/supplies flows into a small
// anchored panel. Follows the same Popper + Paper + ClickAwayListener pattern
// already used by HeaderSearch.tsx and AppShell.tsx's admin flyout - no
// precedent for MUI's Popover component in this codebase.
export default function AppointmentQuickPopover({ appointment, anchorEl, onClose, onViewDetails }: Props) {
  const updateStatus = useUpdateAppointmentStatus();
  const nextStatus = NEXT_STATUS[appointment.status];

  function advance() {
    if (nextStatus) {
      updateStatus.mutate({ id: appointment.id, request: { status: nextStatus } });
    }
  }

  return (
    <ClickAwayListener onClickAway={onClose}>
      <Popper
        open={!!anchorEl}
        anchorEl={anchorEl}
        placement="bottom-start"
        sx={{ zIndex: (t) => t.zIndex.modal }}
        onKeyDown={(e) => {
          if (e.key === "Escape") onClose();
        }}
      >
        <Paper variant="outlined" sx={{ mt: 0.5, width: 300, p: 2 }}>
          <Typography sx={{ fontWeight: 600, mb: 0.5 }}>{appointment.patientName}</Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(appointment.startAtUtc)} · {formatTime(appointment.startAtUtc)} – {formatTime(appointment.endAtUtc)}
          </Typography>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {appointment.appointmentTypeName} · Dr. {appointment.dentistName}
            {appointment.chairName ? ` · ${appointment.chairName}` : ""}
          </Typography>
          <Box sx={{ mb: 1.5 }}>
            <StatusChip status={appointment.status} />
          </Box>
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {nextStatus && (
              <Button size="small" variant="outlined" onClick={advance} disabled={updateStatus.isPending}>
                Mark {nextStatus}
              </Button>
            )}
            <Button size="small" onClick={onViewDetails}>
              View full details
            </Button>
          </Box>
        </Paper>
      </Popper>
    </ClickAwayListener>
  );
}
