import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Link,
  Paper,
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
import { usePatients } from "../../hooks/queries/usePatients";
import { QueryState } from "../../components/QueryState";

const PAGE_SIZE = 25;

export default function PatientsListPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = usePatients(search, page * PAGE_SIZE, PAGE_SIZE);

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Patients
        </Typography>
        <Button component={RouterLink} to="/patients/new" variant="contained" startIcon={<AddIcon />}>
          New Patient
        </Button>
      </Box>

      <TextField
        placeholder="Search by name or phone…"
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
                    <TableCell>Name</TableCell>
                    <TableCell>Date of birth</TableCell>
                    <TableCell>Phone</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/patients/${p.id}`}>
                          {p.firstName} {p.lastName}
                        </Link>
                      </TableCell>
                      <TableCell>{p.dateOfBirth}</TableCell>
                      <TableCell>{p.phone ?? "—"}</TableCell>
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
    </Box>
  );
}
