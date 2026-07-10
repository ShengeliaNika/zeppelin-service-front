import { Accordion, AccordionDetails, AccordionSummary, Box, Chip, Typography } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useAuth } from "../../auth/AuthContext";
import { useMyCompletedAppointments } from "../../hooks/queries/useScheduling";
import { QueryState } from "../../components/QueryState";
import { formatDate, formatTime } from "../scheduler/utils/appointmentFormat";
import SuppliesUsedPanel from "../scheduler/components/SuppliesUsedPanel";
import type { Appointment } from "../../api/types";

function sortAppointments(appointments: Appointment[]): Appointment[] {
  return [...appointments].sort((a, b) => {
    if (a.hasLoggedSupplies !== b.hasLoggedSupplies) return a.hasLoggedSupplies ? 1 : -1;
    return b.startAtUtc.localeCompare(a.startAtUtc);
  });
}

export default function MyPatientsPage() {
  const { user } = useAuth();
  const { data: appointments, isLoading, error } = useMyCompletedAppointments(user?.id);

  const sorted = appointments ? sortAppointments(appointments) : [];

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        My Patients
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Completed appointments - log the supplies you used for each visit.
      </Typography>

      <QueryState isLoading={isLoading} error={error}>
        {sorted.length === 0 ? (
          <Typography color="text.secondary">No completed appointments yet.</Typography>
        ) : (
          sorted.map((a) => (
            <Accordion key={a.id} variant="outlined" disableGutters sx={{ mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap", width: "100%", pr: 1 }}>
                  <Typography sx={{ fontWeight: 600 }}>{a.patientName}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {formatDate(a.startAtUtc)} · {formatTime(a.startAtUtc)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {a.appointmentTypeName}
                  </Typography>
                  <Chip
                    size="small"
                    label={a.hasLoggedSupplies ? "Logged" : "Pending"}
                    color={a.hasLoggedSupplies ? "success" : "warning"}
                    sx={{ ml: "auto" }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <SuppliesUsedPanel appointmentId={a.id} appointmentTypeId={a.appointmentTypeId} />
              </AccordionDetails>
            </Accordion>
          ))
        )}
      </QueryState>
    </Box>
  );
}
