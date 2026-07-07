import { useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SchedulerCalendar from "./components/SchedulerCalendar";
import AppointmentFormModal from "./components/AppointmentFormModal";

function nextHalfHour() {
  const now = new Date();
  now.setMinutes(now.getMinutes() < 30 ? 30 : 60, 0, 0);
  return now;
}

export default function SchedulerPage() {
  const [showForm, setShowForm] = useState(false);

  function openNewAppointmentForm() {
    setShowForm(true);
  }

  const defaultStart = nextHalfHour();
  const defaultEnd = new Date(defaultStart.getTime() + 30 * 60_000);

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Scheduler
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openNewAppointmentForm}>
          New Appointment
        </Button>
      </Box>

      <SchedulerCalendar />

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
