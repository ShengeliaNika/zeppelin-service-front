import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DateSelectArg, EventClickArg, EventDropArg } from "@fullcalendar/core";
import type { DateClickArg, EventResizeDoneArg } from "@fullcalendar/interaction";
import { Alert, Box, Button, IconButton, MenuItem, Snackbar, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useAppointments } from "../../../hooks/queries/useScheduling";
import { useRescheduleAppointment } from "../../../hooks/mutations/useAppointmentMutations";
import { ApiError } from "../../../api/client";
import type { Appointment } from "../../../api/types";
import AppointmentFormModal from "./AppointmentFormModal";
import AppointmentDetailsDialog from "./AppointmentDetailsDialog";
import AppointmentQuickPopover from "./AppointmentQuickPopover";

const VIEWS = [
  { value: "timeGridDay", label: "Day" },
  { value: "timeGridWeek", label: "Week" },
  { value: "dayGridMonth", label: "Month" },
];

interface Props {
  colorByDentist: Map<string, string>;
  visibleDentistIds: Set<string>;
  focusedDate: Date;
  onDateChange: (date: Date) => void;
}

export default function SchedulerCalendar({ colorByDentist, visibleDentistIds, focusedDate, onDateChange }: Props) {
  const theme = useTheme();
  // Matches AppShell's breakpoint so the calendar's default view and the nav's
  // drawer collapse switch at the same viewport width.
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const calendarRef = useRef<FullCalendar>(null);

  const [range, setRange] = useState<{ start: string; end: string }>(() => {
    const now = new Date();
    const start = new Date(now);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    return { start: start.toISOString(), end: end.toISOString() };
  });
  const [title, setTitle] = useState("");
  const [viewType, setViewType] = useState(() => (isMobile ? "timeGridDay" : "timeGridWeek"));
  // Tracks whether the doctor has picked a view themselves, so the effect below
  // only auto-switches for mobile/desktop before that - once they've chosen a
  // view explicitly (e.g. Week on a phone), a later resize won't override it.
  const userChangedViewRef = useRef(false);

  useEffect(() => {
    if (userChangedViewRef.current) return;
    const nextView = isMobile ? "timeGridDay" : "timeGridWeek";
    setViewType(nextView);
    calendarRef.current?.getApi().changeView(nextView);
  }, [isMobile]);

  // Suppresses the datesSet->onDateChange echo caused by our own gotoDate call
  // below, so picking an exact day in the sidebar's mini calendar doesn't get
  // immediately overwritten by the resulting week-range's start date (Sunday).
  const isSyncingFocusedDateRef = useRef(false);

  useEffect(() => {
    isSyncingFocusedDateRef.current = true;
    calendarRef.current?.getApi().gotoDate(focusedDate);
  }, [focusedDate]);

  const { data: appointments } = useAppointments(range.start, range.end);

  const [createRange, setCreateRange] = useState<{ start: Date; end: Date } | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [quickPopoverAnchor, setQuickPopoverAnchor] = useState<HTMLElement | null>(null);
  const [quickPopoverAppointment, setQuickPopoverAppointment] = useState<Appointment | null>(null);
  const [conflictError, setConflictError] = useState<string | null>(null);

  const reschedule = useRescheduleAppointment();

  const events = useMemo(
    () =>
      (appointments ?? [])
        .filter((a) => visibleDentistIds.has(a.dentistUserId))
        .map((a) => ({
          id: a.id,
          title: `${a.patientName} · ${a.appointmentTypeName}`,
          start: a.startAtUtc,
          end: a.endAtUtc,
          backgroundColor: colorByDentist.get(a.dentistUserId) ?? "#616161",
          borderColor: colorByDentist.get(a.dentistUserId) ?? "#616161",
          classNames: [`status-${a.status.toLowerCase()}`],
          extendedProps: { appointment: a },
        })),
    [appointments, colorByDentist, visibleDentistIds],
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
    userChangedViewRef.current = true;
    setViewType(view);
    calendarRef.current?.getApi().changeView(view);
  }

  function handleSelect(info: DateSelectArg) {
    setCreateRange({ start: info.start, end: info.end });
    info.view.calendar.unselect();
  }

  // Fires on any plain tap/click with no drag and no timing dependency, unlike
  // `select` above which - even with selectLongPressDelay=0 - still relies on
  // FullCalendar's touch-drag gesture detection and wasn't reliably opening the
  // form on mobile. This is the primary create-trigger for a single tap; `select`
  // still handles an actual click-and-drag range on both desktop and mobile.
  function handleDateClick(info: DateClickArg) {
    const start = info.date;
    const end = new Date(start.getTime() + 30 * 60 * 1000);
    setCreateRange({ start, end });
  }

  // Desktop/tablet: quick-glance popover anchored to the clicked event, mirroring
  // Google Calendar's own click behavior. Mobile: straight to the full details
  // dialog - anchoring a small popover next to a touch target is awkward there,
  // and it keeps the mobile flow already in place unchanged.
  function handleEventClick(info: EventClickArg) {
    const appointment = info.event.extendedProps.appointment as Appointment;
    if (isMobile) {
      setSelectedAppointment(appointment);
    } else {
      setQuickPopoverAppointment(appointment);
      setQuickPopoverAnchor(info.el);
    }
  }

  function closeQuickPopover() {
    setQuickPopoverAnchor(null);
    setQuickPopoverAppointment(null);
  }

  function viewFullDetailsFromPopover() {
    if (quickPopoverAppointment) setSelectedAppointment(quickPopoverAppointment);
    closeQuickPopover();
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
        height: "100%",
        display: "flex",
        flexDirection: "column",
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
        "& .fc-event": {
          borderRadius: "6px",
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
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2, flexWrap: "wrap", flexShrink: 0 }}>
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
        <TextField select size="small" value={viewType} onChange={(e) => changeView(e.target.value)} sx={{ minWidth: 110 }}>
          {VIEWS.map((v) => (
            <MenuItem key={v.value} value={v.value}>
              {v.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {/* flex:1 + minHeight:0 lets this box take all space left over after the
          toolbar above, so FullCalendar's height="100%" below resolves against
          a real pixel height instead of collapsing to its content size. */}
      <Box sx={{ flex: 1, minHeight: 0 }}>
        <FullCalendar
          ref={calendarRef}
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewType}
          headerToolbar={false}
          // Fills the flex:1 wrapper above instead of an arbitrary vh fraction,
          // so the grid uses all space actually available on the page - same
          // fixed-viewport-with-internal-scroll behavior Google Calendar uses.
          height="100%"
          // Opens the time grid already scrolled to business hours instead of
          // midnight (Google Calendar does the same) - still fully scrollable
          // to any hour, this only sets where the view lands initially.
          scrollTime="07:00:00"
          nowIndicator
          selectable
          // Without this, touch devices require a ~1s long-press before a tap
          // registers as a selection (FullCalendar's default anti-scroll-conflict
          // heuristic) - a plain mouse click has no such delay. Setting it to 0
          // makes tapping an empty slot open the create-appointment form
          // immediately, the same as clicking does on desktop.
          selectLongPressDelay={0}
          editable
          events={events}
          select={handleSelect}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          eventDrop={handleEventDrop}
          eventResize={handleEventResize}
          datesSet={(arg) => {
            setRange({ start: arg.start.toISOString(), end: arg.end.toISOString() });
            setTitle(arg.view.title);
            if (isSyncingFocusedDateRef.current) {
              isSyncingFocusedDateRef.current = false;
            } else {
              onDateChange(arg.start);
            }
          }}
        />
      </Box>

      {createRange && (
        <AppointmentFormModal
          initialStart={createRange.start}
          initialEnd={createRange.end}
          onSave={() => setCreateRange(null)}
          onCancel={() => setCreateRange(null)}
        />
      )}

      {quickPopoverAppointment && (
        <AppointmentQuickPopover
          appointment={quickPopoverAppointment}
          anchorEl={quickPopoverAnchor}
          onClose={closeQuickPopover}
          onViewDetails={viewFullDetailsFromPopover}
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
