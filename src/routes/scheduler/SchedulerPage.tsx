import { useEffect, useMemo, useRef, useState } from "react";
import { Box, Button, IconButton, Typography, useMediaQuery, useTheme } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { useStaffDirectory } from "../../hooks/queries/useScheduling";
import SchedulerSidebar from "./components/SchedulerSidebar";
import SchedulerCalendar from "./components/SchedulerCalendar";
import AppointmentFormModal from "./components/AppointmentFormModal";

const DENTIST_PALETTE = ["#2a78d6", "#1baf7a", "#eb6834", "#4a3aa7", "#0d9488", "#c026d3", "#65a30d", "#b45309"];

function nextHalfHour() {
  const now = new Date();
  now.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
  return now;
}

export default function SchedulerPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [showForm, setShowForm] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => !isMobile);
  const [focusedDate, setFocusedDate] = useState(() => new Date());

  const { data: staff } = useStaffDirectory();

  const colorByDentist = useMemo(() => {
    const map = new Map<string, string>();
    (staff ?? []).forEach((s, i) => map.set(s.id, DENTIST_PALETTE[i % DENTIST_PALETTE.length]));
    return map;
  }, [staff]);

  const [visibleDentistIds, setVisibleDentistIds] = useState<Set<string>>(new Set());
  const staffInitializedRef = useRef(false);

  useEffect(() => {
    if (staff && !staffInitializedRef.current) {
      setVisibleDentistIds(new Set(staff.map((s) => s.id)));
      staffInitializedRef.current = true;
    }
  }, [staff]);

  function toggleDentist(id: string) {
    setVisibleDentistIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function openNewAppointmentForm() {
    setShowForm(true);
  }

  const defaultStart = nextHalfHour();
  const defaultEnd = new Date(defaultStart.getTime() + 30 * 60_000);

  return (
    // height: 100% (resolved against AppShell's <main>, which is a definite-height
    // flex child) + the row below stretching via flex:1 is what lets the calendar
    // fill all remaining vertical space instead of an arbitrary vh fraction that
    // leaves dead space below it, matching Google Calendar's own fixed-viewport layout.
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2, flexShrink: 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {isMobile && (
            <IconButton onClick={() => setSidebarOpen((o) => !o)} aria-label="Toggle scheduler sidebar" size="small">
              <TuneOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Scheduler
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewAppointmentForm}>
          New Appointment
        </Button>
      </Box>

      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, flex: 1, minHeight: 0 }}>
        {sidebarOpen && (
          <Box sx={{ width: { xs: "100%", md: 280 }, flexShrink: 0 }}>
            <SchedulerSidebar
              staff={staff ?? []}
              colorByDentist={colorByDentist}
              visibleDentistIds={visibleDentistIds}
              onToggleDentist={toggleDentist}
              focusedDate={focusedDate}
              onDateSelect={setFocusedDate}
            />
          </Box>
        )}

        <Box sx={{ flex: 1, minWidth: 0, minHeight: 0, width: "100%" }}>
          <SchedulerCalendar
            colorByDentist={colorByDentist}
            visibleDentistIds={visibleDentistIds}
            focusedDate={focusedDate}
            onDateChange={setFocusedDate}
          />
        </Box>
      </Box>

      {showForm && (
        <AppointmentFormModal
          initialStart={defaultStart}
          initialEnd={defaultEnd}
          onSave={() => setShowForm(false)}
          onCancel={() => setShowForm(false)}
        />
      )}
    </Box>
  );
}
