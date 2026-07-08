import { useState, type FormEvent } from "react";
import { Box, Button, Stack, TextField } from "@mui/material";
import type { Patient } from "../../../api/types";

interface InsuranceValues {
  identityNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  insuranceGroupNumber?: string;
}

export default function InsuranceForm({
  patient,
  submitting,
  onSubmit,
}: {
  patient: Patient;
  submitting: boolean;
  onSubmit: (values: InsuranceValues) => Promise<unknown>;
}) {
  const [identityNumber, setIdentityNumber] = useState(patient.identityNumber ?? "");
  const [insuranceProvider, setInsuranceProvider] = useState(patient.insuranceProvider ?? "");
  const [insurancePolicyNumber, setInsurancePolicyNumber] = useState(patient.insurancePolicyNumber ?? "");
  const [insuranceGroupNumber, setInsuranceGroupNumber] = useState(patient.insuranceGroupNumber ?? "");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      identityNumber: identityNumber || undefined,
      insuranceProvider: insuranceProvider || undefined,
      insurancePolicyNumber: insurancePolicyNumber || undefined,
      insuranceGroupNumber: insuranceGroupNumber || undefined,
    });
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Stack spacing={2} sx={{ mt: 0.5, mb: 2 }}>
        <TextField label="Identity number" value={identityNumber} onChange={(e) => setIdentityNumber(e.target.value)} fullWidth />
        <TextField label="Insurance provider" value={insuranceProvider} onChange={(e) => setInsuranceProvider(e.target.value)} fullWidth />
        <TextField label="Insurance policy #" value={insurancePolicyNumber} onChange={(e) => setInsurancePolicyNumber(e.target.value)} fullWidth />
        <TextField label="Insurance group #" value={insuranceGroupNumber} onChange={(e) => setInsuranceGroupNumber(e.target.value)} fullWidth />
      </Stack>
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? "Saving…" : "Save"}
      </Button>
    </Box>
  );
}
