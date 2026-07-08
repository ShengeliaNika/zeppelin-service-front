import { useState, type SyntheticEvent } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import CallOutlinedIcon from "@mui/icons-material/CallOutlined";
import SmsOutlinedIcon from "@mui/icons-material/SmsOutlined";
import AddIcon from "@mui/icons-material/Add";
import { usePatient } from "../../hooks/queries/usePatients";
import { usePatientAppointments } from "../../hooks/queries/useScheduling";
import { usePatientVisitNotes } from "../../hooks/queries/useClinical";
import { useUpdatePatient } from "../../hooks/mutations/usePatientMutations";
import { QueryState } from "../../components/QueryState";
import { UserAvatar } from "../../components/UserAvatar";
import { StatusChip } from "../../components/StatusChip";
import { calculateAge } from "../../utils/age";
import DemographicsForm from "./components/DemographicsForm";
import MedicalHistoryPanel from "./components/MedicalHistoryPanel";
import Odontogram from "./components/Odontogram";
import TreatmentPlanPanel from "./components/TreatmentPlanPanel";
import AttachmentsTab from "./components/AttachmentsTab";
import InsuranceForm from "./components/InsuranceForm";
import AppointmentFormModal from "../scheduler/components/AppointmentFormModal";
import type { Patient, PatientFormValues } from "../../api/types";

type MiddleTab = "visits" | "plans";
type MainTab = "chart" | "notes" | "documents";

function toFormValues(patient: Patient): PatientFormValues {
  return {
    firstName: patient.firstName,
    lastName: patient.lastName,
    dateOfBirth: patient.dateOfBirth,
    sex: patient.sex ?? undefined,
    phone: patient.phone ?? undefined,
    email: patient.email ?? undefined,
    identityNumber: patient.identityNumber ?? undefined,
    addressLine1: patient.addressLine1 ?? undefined,
    addressLine2: patient.addressLine2 ?? undefined,
    city: patient.city ?? undefined,
    emergencyContactName: patient.emergencyContactName ?? undefined,
    emergencyContactPhone: patient.emergencyContactPhone ?? undefined,
    insuranceProvider: patient.insuranceProvider ?? undefined,
    insurancePolicyNumber: patient.insurancePolicyNumber ?? undefined,
    insuranceGroupNumber: patient.insuranceGroupNumber ?? undefined,
  };
}

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: patient, isLoading, error } = usePatient(id);
  const updatePatient = useUpdatePatient(id!);
  const { data: appointments } = usePatientAppointments(id ?? "");
  const { data: visitNotes } = usePatientVisitNotes(id ?? "");

  const [middleTab, setMiddleTab] = useState<MiddleTab>("visits");
  const [mainTab, setMainTab] = useState<MainTab>("chart");
  const [showEditDemographics, setShowEditDemographics] = useState(false);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [showInsurance, setShowInsurance] = useState(false);
  const [showNewAppointment, setShowNewAppointment] = useState(false);

  async function handleSubmit(values: PatientFormValues) {
    await updatePatient.mutateAsync({ ...values, isActive: patient!.isActive });
  }

  const sortedAppointments = [...(appointments ?? [])].sort((a, b) => b.startAtUtc.localeCompare(a.startAtUtc));

  return (
    <QueryState isLoading={isLoading} error={error}>
      {!patient ? (
        <Typography>Patient not found.</Typography>
      ) : (
        <Box sx={{ display: "flex", gap: 3, alignItems: "flex-start", flexWrap: { xs: "wrap", lg: "nowrap" } }}>
          {/* Sidebar */}
          <Box sx={{ width: 280, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "flex-start", gap: 1.5, mb: 1 }}>
              <UserAvatar firstName={patient.firstName} lastName={patient.lastName} size={64} />
              <IconButton size="small" onClick={() => setShowEditDemographics(true)} sx={{ ml: "auto" }} aria-label="Edit demographics">
                <EditOutlinedIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {patient.firstName} {patient.lastName}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 1 }}>
              {patient.dateOfBirth} • {calculateAge(patient.dateOfBirth)}yo
            </Typography>
            <Chip size="small" label={`MRN: ${patient.patientNumber}`} sx={{ mb: 2 }} />

            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <Button
                size="small"
                variant="outlined"
                startIcon={<CallOutlinedIcon />}
                component="a"
                href={patient.phone ? `tel:${patient.phone}` : undefined}
                disabled={!patient.phone}
              >
                Call
              </Button>
              <Button
                size="small"
                variant="outlined"
                startIcon={<SmsOutlinedIcon />}
                component="a"
                href={patient.phone ? `sms:${patient.phone}` : undefined}
                disabled={!patient.phone}
              >
                Text
              </Button>
            </Box>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              <Button variant="outlined" onClick={() => setShowMedicalHistory(true)}>
                Medical History
              </Button>
              <Button variant="outlined" onClick={() => setShowInsurance(true)}>
                Insurance
              </Button>
            </Box>

            <Dialog open={showEditDemographics} onClose={() => setShowEditDemographics(false)} maxWidth="md" fullWidth>
              <DialogTitle>Edit Demographics</DialogTitle>
              <DialogContent>
                <DemographicsForm
                  initialValues={toFormValues(patient)}
                  submitLabel="Save Changes"
                  submitting={updatePatient.isPending}
                  onSubmit={async (values) => {
                    await handleSubmit(values);
                    setShowEditDemographics(false);
                  }}
                />
              </DialogContent>
            </Dialog>

            <Dialog open={showMedicalHistory} onClose={() => setShowMedicalHistory(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Medical History</DialogTitle>
              <DialogContent>
                <MedicalHistoryPanel patientId={patient.id} entries={patient.medicalHistory} />
              </DialogContent>
            </Dialog>

            <Dialog open={showInsurance} onClose={() => setShowInsurance(false)} maxWidth="sm" fullWidth>
              <DialogTitle>Insurance</DialogTitle>
              <DialogContent>
                <InsuranceForm
                  patient={patient}
                  submitting={updatePatient.isPending}
                  onSubmit={async (values) => {
                    await updatePatient.mutateAsync({ ...toFormValues(patient), ...values, isActive: patient.isActive });
                    setShowInsurance(false);
                  }}
                />
              </DialogContent>
            </Dialog>
          </Box>

          {/* Middle column: Visits / Plans */}
          <Box sx={{ width: 340, flexShrink: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Tabs value={middleTab} onChange={(_: SyntheticEvent, v: MiddleTab) => setMiddleTab(v)}>
                <Tab label="Visits" value="visits" />
                <Tab label="Plans" value="plans" />
              </Tabs>
            </Box>

            {middleTab === "visits" && (
              <Box>
                <Button size="small" startIcon={<AddIcon />} variant="outlined" onClick={() => setShowNewAppointment(true)} sx={{ mb: 1.5 }}>
                  Create Appointment
                </Button>
                {sortedAppointments.length === 0 ? (
                  <Typography color="text.secondary">No visits yet.</Typography>
                ) : (
                  <List dense>
                    {sortedAppointments.map((a) => (
                      <ListItem key={a.id} disableGutters sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 0.5, mb: 1 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}>
                          <Typography sx={{ fontWeight: 600 }}>{new Date(a.startAtUtc).toLocaleDateString()}</Typography>
                          <StatusChip status={a.status} />
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(a.startAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} –{" "}
                          {new Date(a.endAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · {a.appointmentTypeName}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {a.dentistName}
                          {a.chairName ? ` · ${a.chairName}` : ""}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                )}
              </Box>
            )}

            {middleTab === "plans" && <TreatmentPlanPanel patientId={patient.id} />}

            {showNewAppointment && (
              <AppointmentFormModal
                initialStart={new Date()}
                initialEnd={new Date(Date.now() + 60 * 60 * 1000)}
                initialPatient={{
                  id: patient.id,
                  patientNumber: patient.patientNumber,
                  firstName: patient.firstName,
                  lastName: patient.lastName,
                  dateOfBirth: patient.dateOfBirth,
                  phone: patient.phone,
                  email: patient.email,
                  isActive: patient.isActive,
                }}
                onCancel={() => setShowNewAppointment(false)}
                onSave={() => setShowNewAppointment(false)}
              />
            )}
          </Box>

          {/* Main panel: Chart / Notes / Documents */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Tabs value={mainTab} onChange={(_: SyntheticEvent, v: MainTab) => setMainTab(v)} sx={{ mb: 2 }}>
              <Tab label="Chart" value="chart" />
              <Tab label="Notes" value="notes" />
              <Tab label="Documents" value="documents" />
            </Tabs>

            {mainTab === "chart" && <Odontogram patientId={patient.id} />}

            {mainTab === "notes" &&
              (!visitNotes || visitNotes.length === 0 ? (
                <Typography color="text.secondary">No visit notes yet.</Typography>
              ) : (
                <List>
                  {visitNotes.map((n) => (
                    <ListItem key={n.id} disableGutters sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start", mb: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(n.createdAtUtc).toLocaleString()} · {n.authoredByName}
                      </Typography>
                      <Typography>{n.noteText}</Typography>
                      {n.proceduresPerformed && (
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                          Procedures: {n.proceduresPerformed}
                        </Typography>
                      )}
                    </ListItem>
                  ))}
                </List>
              ))}

            {mainTab === "documents" && <AttachmentsTab patientId={patient.id} />}
          </Box>
        </Box>
      )}
    </QueryState>
  );
}
