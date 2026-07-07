import { useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { EventResizeDoneArg } from "@fullcalendar/interaction";
import { Alert, Box, Button, Chip, IconButton, MenuItem, Snackbar, TextField, Typography, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppointments, useStaffDirectory } from "../../../hooks/queries/useScheduling";
import { useRescheduleAppointment } from "../../../hooks/mutations/useAppointmentMutations";
import { ApiError } from "../../../api/client";
import type { Appointment } from "../../../api/types";
import AppointmentFormModal from "./AppointmentFormModal";
import AppointmentDetailsDialog from "./AppointmentDetailsDialog";

const DENTIST_PALETTE = ["#2a78d6", "#1baf7a", "#eb6834", "#4a3aa7", "#0d9488", "#c026d3", "#65a30d", "#b45309"];

const VIEWS = [
  { value: "timeGridDay", label: "Day" },
  { value: "timeGridWeek", label: "Week" },
  { value: "dayGridMonth", label: "Month" },
];

export default function SchedulerCalendar() {
  const theme = useTheme();
  const calendarRef = useRef<FullCalendar>(null);
  const { data: staff } = useStaffDirectory();

  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start: start.toISOString(), end: end.toISOString() };
  });
  const [title, setTitle] = useState("");
  const [viewType, setViewType] = useState("timeGridWeek");

  const { data: appointments } = useAppointments(range.start, range.end);

  const [createRange, setCreateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const reschedule = useRescheduleAppointment();

  const colorByDentist = useMemo(() => {
    const map = new Map<string, string>();
    (staff ?? []).forEach((s, i) => map.set(s.id, DENTIST_PALETTE[i % DENTIST_PALETTE.length]));
    return map;
  }, [staff]);

  const events = useMemo(
    () =>
      (appointments ?? []).map((a) => ({
        id: a.id,
        title: `${a.patientName} · ${a.appointmentTypeName}`,
        start: a.startAtUtc,
        end: a.endAtUtc,
        backgroundColor: colorByDentist.get(a.dentistUserId) ?? "#616161",
        borderColor: colorByDentist.get(a.dentistUserId) ?? "#616161",
        classNames: [`status-${a.status.toLowerCase()}`],
        extendedProps: { appointment: a },
      })),
    [appointments, colorByDentist],
  );

  function goToday() {
    calendarRef.current?.getApi().today();
  }
  function goPrev() {
    calendarRef.current?.getApi().prev();
  }
  function goNext() {
    calendarRef.current?.getApi().next();
  }
  function changeView(view: string) {
    setViewType(view);
    calendarRef.current?.getApi().changeView(view);
  }

  function handleSelect(info: DateSelectArg) {
    setCreateRange({ start: info.start, end: info.end });
    info.view.calendar.unselect();
  }

  function handleEventClick(info: EventClickArg) {
    setSelectedAppointment(info.event.extendedProps.appointment as Appointment);
  }

  async function handleEventDrop(info: EventDropArg) {
    const appointment = info.event.extendedProps.appointment as Appointment;
    if (!info.event.start || !info.event.end) return;
    try {
      await reschedule.mutateAsync({
        id: appointment.id,
        request: {
          dentistUserId: appointment.dentistUserId,
          chairId: appointment.chairId ?? undefined,
          appointmentTypeId: appointment.appointmentTypeId,
          startAtUtc: info.event.start.toISOString(),
          endAtUtc: info.event.end.toISOString(),
          notes: appointment.notes ?? undefined,
        },
      });
    } catch (err) {
      info.revert();
      setConflictError(err instanceof ApiError && err.status === 409 ? "That dentist or chair is already booked in this time range." : "Failed to reschedule appointment.");
    }
  }

  async function handleEventResize(info: EventResizeDoneArg) {
    const appointment = info.event.extendedProps.appointment as Appointment;
    if (!info.event.start || !info.event.end) return;
    try {
      await reschedule.mutateAsync({
        id: appointment.id,
        request: {
          dentistUserId: appointment.dentistUserId,
          chairId: appointment.chairId ?? undefined,
          appointmentTypeId: appointment.appointmentTypeId,
          startAtUtc: info.event.start.toISOString(),
          endAtUtc: info.event.end.toISOString(),
          notes: appointment.notes ?? undefined,
        },
      });
    } catch (err) {
      info.revert();
      setConflictError(err instanceof ApiError && err.status === 409 ? "That dentist or chair is already booked in this time range." : "Failed to reschedule appointment.");
    }
  }

  return (
    <Box
      sx={{
        "& .fc": {
          "--fc-border-color": theme.palette.divider,
          "--fc-page-bg-color": "transparent",
          "--fc-neutral-bg-color": theme.palette.action.hover,
          "--fc-today-bg-color": theme.palette.action.selected,
          "--fc-event-text-color": "#fff",
          "--fc-list-event-hover-bg-color": theme.palette.action.hover,
          color: theme.palette.text.primary,
        },
        "& .fc-timegrid-slot-label-cushion, & .fc-col-header-cell-cushion, & .fc-daygrid-day-number": {
          color: theme.palette.text.secondary,
        },
        "& .status-cancelled, & .status-noshow": {
          opacity: 0.55,
          textDecoration: "line-through",
        },
        "& .status-completed": {
          opacity: 0.85,
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap" }}>
        <Button variant="outlined" onClick={goToday}>
          Today
        </Button>
        <IconButton onClick={goPrev}>
          <ChevronLeftIcon />
        </IconButton>
        <IconButton onClick={goNext}>
          <ChevronRightIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mr: "auto" }}>
          {title}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
          {(staff ?? []).map((s) => (
            <Chip
              key={s.id}
              label={`${s.firstName} ${s.lastName}`}
              size="small"
              sx={{ bgcolor: colorByDentist.get(s.id), color: "#fff" }}
            />
          ))}
        </Box>
        <TextField select size="small" value={viewType} onChange={(e) => changeView(e.target.value)} sx={{ minWidth: 110 }}>
          {VIEWS.map((v) => (
            <MenuItem key={v.value} value={v.value}>
              {v.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar={false}
        height="auto"
        nowIndicator
        selectable
        editable
        events={events}
        select={handleSelect}
        eventClick={handleEventClick}
        eventDrop={handleEventDrop}
        eventResize={handleEventResize}
        datesSet={(arg) => {
          setRange({ start: arg.start.toISOString(), end: arg.end.toISOString() });
          setTitle(arg.view.title);
        }}
      />

      {createRange && (
        <AppointmentFormModal
          initialStart={createRange.start}
          initialEnd={createRange.end}
          onSave={() => setCreateRange(null)}
          onCancel={() => setCreateRange(null)}
        />
      )}

      {selectedAppointment && (
        <AppointmentDetailsDialog appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
      )}

      <Snackbar open={!!conflictError} autoHideDuration={4000} onClose={() => setConflictError(null)}>
        <Alert severity="error" onClose={() => setConflictError(null)}>
          {conflictError}
        </Alert>
      </Snackbar>
    </Box>
  );
}
