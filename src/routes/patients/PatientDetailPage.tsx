import { useState, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import { Box, Tab, Tabs, Typography } from "@mui/material";
import { usePatient } from "../../hooks/queries/usePatients";
import { useUpdatePatient } from "../../hooks/mutations/usePatientMutations";
import { QueryState } from "../../components/QueryState";
import DemographicsForm from "./components/DemographicsForm";
import MedicalHistoryPanel from "./components/MedicalHistoryPanel";
import Odontogram from "./components/Odontogram";
import TreatmentPlanPanel from "./components/TreatmentPlanPanel";
import AttachmentsTab from "./components/AttachmentsTab";
import type { PatientFormValues } from "../../api/types";

type TabKey = "demographics" | "history" | "chart" | "plans" | "attachments";

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id);
  const updatePatient = useUpdatePatient(id!);
  const [tab, setTab] = useState<TabKey>("demographics");

  async function handleSubmit(values: PatientFormValues) {
    await updatePatient.mutateAsync({ ...values, isActive: patient!.isActive });
  }

  return (
    <QueryState isLoading={isLoading} error={error}>
      {!patient ? (
        <Typography>Patient not found.</Typography>
      ) : (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
            {patient.firstName} {patient.lastName}
          </Typography>

          <Tabs value={tab} onChange={(_: SyntheticEvent, value: TabKey) => setTab(value)} sx={{ mb: 3 }}>
            <Tab label="Demographics" value="demographics" />
            <Tab label="Medical History" value="history" />
            <Tab label="Dental Chart" value="chart" />
            <Tab label="Treatment Plans" value="plans" />
            <Tab label="Attachments" value="attachments" />
          </Tabs>

          {tab === "demographics" && (
            <DemographicsForm
              initialValues={{
                firstName: patient.firstName,
                lastName: patient.lastName,
                dateOfBirth: patient.dateOfBirth,
                sex: patient.sex ?? undefined,
                phone: patient.phone ?? undefined,
                email: patient.email ?? undefined,
                addressLine1: patient.addressLine1 ?? undefined,
                addressLine2: patient.addressLine2 ?? undefined,
                city: patient.city ?? undefined,
                emergencyContactName: patient.emergencyContactName ?? undefined,
                emergencyContactPhone: patient.emergencyContactPhone ?? undefined,
                insuranceProvider: patient.insuranceProvider ?? undefined,
                insurancePolicyNumber: patient.insurancePolicyNumber ?? undefined,
                insuranceGroupNumber: patient.insuranceGroupNumber ?? undefined,
              }}
              submitLabel="Save Changes"
              submitting={updatePatient.isPending}
              onSubmit={handleSubmit}
            />
          )}

          {tab === "history" && <MedicalHistoryPanel patientId={patient.id} entries={patient.medicalHistory} />}
          {tab === "chart" && <Odontogram patientId={patient.id} />}
          {tab === "plans" && <TreatmentPlanPanel patientId={patient.id} />}
          {tab === "attachments" && <AttachmentsTab patientId={patient.id} />}
        </Box>
      )}
    </QueryState>
  );
}
