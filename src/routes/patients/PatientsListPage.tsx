import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { usePatients, usePatientStatusCounts } from "../../hooks/queries/usePatients";
import { useCreatePatient } from "../../hooks/mutations/usePatientMutations";
import { QueryState } from "../../components/QueryState";
import { UserAvatar } from "../../components/UserAvatar";
import { calculateAge } from "../../utils/age";
import DemographicsForm from "./components/DemographicsForm";
import type { PatientFormValues, PatientSearchBy, PatientStatusFilter } from "../../api/types";

const PAGE_SIZE = 25;

const SEARCH_MODES: { value: PatientSearchBy; label: string; placeholder: string }[] = [
  { value: "name", label: "Name", placeholder: "Search by name…" },
  { value: "phone", label: "Phone", placeholder: "Search by phone…" },
  { value: "mrn", label: "MRN", placeholder: "Search by MRN…" },
  { value: "identity", label: "Identity", placeholder: "Search by identity number…" },
  { value: "email", label: "Email", placeholder: "Search by email address…" },
];

const STATUS_TABS: { value: PatientStatusFilter; label: string }[] = [
  { value: "all", label: "All Patients" },
  { value: "initial", label: "Initial" },
  { value: "archived", label: "Archived" },
];

export default function PatientsListPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [searchBy, setSearchBy] = useState<PatientSearchBy>("name");
  const [status, setStatus] = useState<PatientStatusFilter>("all");
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = usePatients(search, page * PAGE_SIZE, PAGE_SIZE, searchBy, status);
  const { data: counts } = usePatientStatusCounts();
  const createPatient = useCreatePatient();
  const [showNewPatient, setShowNewPatient] = useState(false);

  async function handleCreate(values: PatientFormValues) {
    const patient = await createPatient.mutateAsync(values);
    setShowNewPatient(false);
    navigate(`/patients/${patient.id}`);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleSearchByChange(value: PatientSearchBy) {
    setSearchBy(value);
    setSearch("");
    setPage(0);
  }

  function handleStatusChange(value: PatientStatusFilter) {
    setStatus(value);
    setPage(0);
  }

  const mode = SEARCH_MODES.find((m) => m.value === searchBy)!;

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Patients
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNewPatient(true)}>
          Create Patient
        </Button>
      </Box>

      <Dialog open={showNewPatient} onClose={() => setShowNewPatient(false)} maxWidth="md" fullWidth>
        <DialogTitle>New Patient</DialogTitle>
        <DialogContent>
          <DemographicsForm submitLabel="Create Patient" submitting={createPatient.isPending} onSubmit={handleCreate} />
          {createPatient.isError && (
            <Alert severity="error" sx={{ mt: 2 }}>
              Failed to create patient.
            </Alert>
          )}
        </DialogContent>
      </Dialog>
      {data && counts && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          {data.totalCount} / {counts.all}
        </Typography>
      )}

      <Stack direction="row" spacing={1} sx={{ mb: 1.5, flexWrap: "wrap" }}>
        {SEARCH_MODES.map((m) => (
          <Chip
            key={m.value}
            label={m.label}
            clickable
            color={searchBy === m.value ? "primary" : "default"}
            variant={searchBy === m.value ? "filled" : "outlined"}
            onClick={() => handleSearchByChange(m.value)}
          />
        ))}
      </Stack>

      <TextField
        placeholder={mode.placeholder}
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        size="small"
        sx={{ mb: 2, width: 320 }}
      />

      <QueryState isLoading={isLoading} error={error}>
        {data && data.items.length === 0 && <Typography>No patients found.</Typography>}
        {data && data.items.length > 0 && (
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Patient</TableCell>
                    <TableCell>Phone</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                          <UserAvatar firstName={p.firstName} lastName={p.lastName} size={36} />
                          <Box>
                            <Link component={RouterLink} to={`/patients/${p.id}`} sx={{ fontWeight: 600 }}>
                              {p.firstName} {p.lastName}
                            </Link>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                              {p.patientNumber} / {p.dateOfBirth} / {calculateAge(p.dateOfBirth)}yo
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>{p.phone ?? "—"}</TableCell>
                      <TableCell>{p.email ?? "—"}</TableCell>
                      <TableCell>
                        <Chip size="small" label={p.isActive ? "Active" : "Archived"} color={p.isActive ? "success" : "default"} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
            />
          </Paper>
        )}
      </QueryState>

      <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
        {STATUS_TABS.map((t) => (
          <Chip
            key={t.value}
            label={counts ? `${t.label} (${counts[t.value]})` : t.label}
            clickable
            color={status === t.value ? "primary" : "default"}
            variant={status === t.value ? "filled" : "outlined"}
            onClick={() => handleStatusChange(t.value)}
          />
        ))}
      </Stack>
    </Box>
  );
}
