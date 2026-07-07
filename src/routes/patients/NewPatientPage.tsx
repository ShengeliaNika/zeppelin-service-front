import { useNavigate } from "react-router-dom";
import { Alert, Box, Typography } from "@mui/material";
import DemographicsForm from "./components/DemographicsForm";
import { useCreatePatient } from "../../hooks/mutations/usePatientMutations";
import type { PatientFormValues } from "../../api/types";

export default function NewPatientPage() {
  const navigate = useNavigate();
  const createPatient = useCreatePatient();

  async function handleSubmit(values: PatientFormValues) {
    const patient = await createPatient.mutateAsync(values);
    navigate(`/patients/${patient.id}`);
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        New Patient
      </Typography>
      <DemographicsForm submitLabel="Create Patient" submitting={createPatient.isPending} onSubmit={handleSubmit} />
      {createPatient.isError && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 400 }}>
          Failed to create patient.
        </Alert>
      )}
    </Box>
  );
}
