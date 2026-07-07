import { useState, type FormEvent, type SyntheticEvent } from "react";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  TextField,
} from "@mui/material";
import { usePatients } from "../../../hooks/queries/usePatients";
import { useAppointmentTypes, useChairs, useStaffDirectory } from "../../../hooks/queries/useScheduling";
import { useCreateAppointment } from "../../../hooks/mutations/useAppointmentMutations";
import { ApiError } from "../../../api/client";
import type { PatientSummary } from "../../../api/types";

// Extracted using local getters (not toISOString) because the rest of the
// app treats wall-clock input as literal UTC (see the `${date}T${time}:00Z`
// construction below) - using toISOString here would shift by the browser's
// timezone offset and silently double-convert.
function toDateInputValue(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function toTimeInputValue(d: Date) {
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 15-minute increments across the full day, e.g. Google Calendar's quick-add
// time picker.
const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const totalMinutes = i * 15;
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
});

function formatTimeLabel(time: string) {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 || 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function addMinutes(time: string, minutesToAdd: number) {
  const [h, m] = time.split(":").map(Number);
  const total = (h * 60 + m + minutesToAdd + 24 * 60) % (24 * 60);
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

interface Props {
  initialStart: Date;
  initialEnd: Date;
  onSave: () => void;
  onCancel: () => void;
}

export default function AppointmentFormModal({ initialStart, initialEnd, onSave, onCancel }: Props) {
  const [patientSearch, setPatientSearch] = useState("");
  const { data: patients } = usePatients(patientSearch);
  const { data: appointmentTypes } = useAppointmentTypes();
  const { data: chairs } = useChairs();
  const { data: staff } = useStaffDirectory();
  const createAppointment = useCreateAppointment();

  const [selectedPatient, setSelectedPatient] = useState<PatientSummary | null>(null);
  const [dentistUserId, setDentistUserId] = useState("");
  const [chairId, setChairId] = useState("");
  const [appointmentTypeId, setAppointmentTypeId] = useState("");
  const [date, setDate] = useState(toDateInputValue(initialStart));
  const [startTime, setStartTime] = useState(toTimeInputValue(initialStart));
  const [endTime, setEndTime] = useState(toTimeInputValue(initialEnd));
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!selectedPatient || !dentistUserId || !appointmentTypeId) {
      setError("Patient, dentist, and appointment type are required.");
      return;
    }
    if (endTime <= startTime) {
      setError("End time must be after start time.");
      return;
    }

    try {
      await createAppointment.mutateAsync({
        patientId: selectedPatient.id,
        dentistUserId,
        chairId: chairId || undefined,
        appointmentTypeId,
        startAtUtc: `${date}T${startTime}:00Z`,
        endAtUtc: `${date}T${endTime}:00Z`,
        notes: notes || undefined,
      });
      onSave();
    } catch (err) {
      if (err instanceof ApiError && err.status === 409) {
        setError("That dentist or chair is already booked in this time range.");
      } else {
        setError("Failed to save appointment.");
      }
    }
  }

  return (
    <Dialog open onClose={onCancel} maxWidth="xs" fullWidth>
      <DialogTitle>New Appointment</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Autocomplete
            options={patients?.items ?? []}
            getOptionLabel={(p) => `${p.firstName} ${p.lastName}`}
            value={selectedPatient}
            onChange={(_: SyntheticEvent, value: PatientSummary | null) => setSelectedPatient(value)}
            onInputChange={(_: SyntheticEvent, value: string) => setPatientSearch(value)}
            renderInput={(params) => <TextField {...params} label="Patient" required />}
          />

          <TextField
            select
            label="Appointment Type"
            value={appointmentTypeId}
            onChange={(e) => setAppointmentTypeId(e.target.value)}
            required
          >
            {appointmentTypes?.map((t) => (
              <MenuItem key={t.id} value={t.id}>
                {t.name} ({t.defaultDurationMinutes} min)
              </MenuItem>
            ))}
          </TextField>

          <TextField
            type="date"
            label="Date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            slotProps={{ inputLabel: { shrink: true } }}
          />

          <Box sx={{ display: "flex", gap: 2 }}>
            <Autocomplete
              disableClearable
              options={TIME_OPTIONS}
              getOptionLabel={formatTimeLabel}
              value={startTime}
              onChange={(_: SyntheticEvent, value: string | null) => {
                if (value) {
                  setStartTime(value);
                  setEndTime(addMinutes(value, 60));
                }
              }}
              renderInput={(params) => <TextField {...params} label="Start Time" required />}
              sx={{ flex: 1 }}
            />
            <Autocomplete
              disableClearable
              options={TIME_OPTIONS}
              getOptionLabel={formatTimeLabel}
              value={endTime}
              onChange={(_: SyntheticEvent, value: string | null) => value && setEndTime(value)}
              renderInput={(params) => <TextField {...params} label="End Time" required />}
              sx={{ flex: 1 }}
            />
          </Box>

          <TextField
            select
            label="Dentist"
            value={dentistUserId}
            onChange={(e) => setDentistUserId(e.target.value)}
            required
          >
            {staff?.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.firstName} {s.lastName} ({s.roles.join(", ")})
              </MenuItem>
            ))}
          </TextField>

          <TextField select label="Chair (optional)" value={chairId} onChange={(e) => setChairId(e.target.value)}>
            <MenuItem value="">No specific chair</MenuItem>
            {chairs?.map((c) => (
              <MenuItem key={c.id} value={c.id}>
                {c.name}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            multiline
            minRows={2}
          />

          {error && <Alert severity="error">{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={onCancel} disabled={createAppointment.isPending}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={createAppointment.isPending}>
            {createAppointment.isPending ? "Saving…" : "Save Appointment"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
