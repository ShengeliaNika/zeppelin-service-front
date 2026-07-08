import { useState, type FormEvent } from "react";
import { Box, Button, Grid, TextField } from "@mui/material";
import type { PatientFormValues } from "../../../api/types";

interface Props {
  initialValues?: Partial<PatientFormValues>;
  submitLabel: string;
  submitting: boolean;
  onSubmit: (values: PatientFormValues) => void;
}

const emptyValues: PatientFormValues = {
  firstName: "",
  lastName: "",
  dateOfBirth: "",
  sex: "",
  phone: "",
  email: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  identityNumber: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  insuranceProvider: "",
  insurancePolicyNumber: "",
  insuranceGroupNumber: "",
};

export default function DemographicsForm({ initialValues, submitLabel, submitting, onSubmit }: Props) {
  const [form, setForm] = useState<PatientFormValues>({ ...emptyValues, ...initialValues });

  function set(field: keyof PatientFormValues, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSubmit(form);
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="First name" value={form.firstName} onChange={(e) => set("firstName", e.target.value)} required fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Last name" value={form.lastName} onChange={(e) => set("lastName", e.target.value)} required fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            type="date"
            label="Date of birth"
            value={form.dateOfBirth}
            onChange={(e) => set("dateOfBirth", e.target.value)}
            required
            fullWidth
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Sex" value={form.sex ?? ""} onChange={(e) => set("sex", e.target.value)} fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="Phone" value={form.phone ?? ""} onChange={(e) => set("phone", e.target.value)} fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField type="email" label="Email" value={form.email ?? ""} onChange={(e) => set("email", e.target.value)} fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Identity number"
            value={form.identityNumber ?? ""}
            onChange={(e) => set("identityNumber", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Address line 1"
            value={form.addressLine1 ?? ""}
            onChange={(e) => set("addressLine1", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Address line 2"
            value={form.addressLine2 ?? ""}
            onChange={(e) => set("addressLine2", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField label="City" value={form.city ?? ""} onChange={(e) => set("city", e.target.value)} fullWidth />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Emergency contact name"
            value={form.emergencyContactName ?? ""}
            onChange={(e) => set("emergencyContactName", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Emergency contact phone"
            value={form.emergencyContactPhone ?? ""}
            onChange={(e) => set("emergencyContactPhone", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Insurance provider"
            value={form.insuranceProvider ?? ""}
            onChange={(e) => set("insuranceProvider", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Insurance policy #"
            value={form.insurancePolicyNumber ?? ""}
            onChange={(e) => set("insurancePolicyNumber", e.target.value)}
            fullWidth
          />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <TextField
            label="Insurance group #"
            value={form.insuranceGroupNumber ?? ""}
            onChange={(e) => set("insuranceGroupNumber", e.target.value)}
            fullWidth
          />
        </Grid>
      </Grid>
      <Button type="submit" variant="contained" disabled={submitting}>
        {submitting ? "Saving…" : submitLabel}
      </Button>
    </Box>
  );
}
