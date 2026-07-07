import { useState } from "react";
import {
  Box,
  Chip,
  MenuItem,
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
import { useAuditLog } from "../../hooks/queries/useAdmin";
import { QueryState } from "../../components/QueryState";

const ENTITY_NAMES = ["Patient", "MedicalHistoryEntry", "ToothRecord", "TreatmentPlan", "TreatmentPlanItem", "VisitNote", "Attachment", "Appointment"];
const PAGE_SIZE = 25;

export default function AuditLogPage() {
  const [entityName, setEntityName] = useState<string | undefined>(undefined);
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useAuditLog(entityName, page * PAGE_SIZE, PAGE_SIZE);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Audit Log
      </Typography>

      <TextField
        select
        size="small"
        label="Entity"
        value={entityName ?? ""}
        onChange={(e) => {
          setEntityName(e.target.value || undefined);
          setPage(0);
        }}
        sx={{ mb: 2, minWidth: 220 }}
      >
        <MenuItem value="">All entities</MenuItem>
        {ENTITY_NAMES.map((name) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </TextField>

      <QueryState isLoading={isLoading} error={error}>
        {data && data.items.length === 0 && <Typography>No audit entries found.</Typography>}
        {data && data.items.length > 0 && (
          <Paper variant="outlined">
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>When</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Entity</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((e) => (
                    <TableRow key={e.id} hover>
                      <TableCell>{new Date(e.timestampUtc).toLocaleString()}</TableCell>
                      <TableCell>{e.userName}</TableCell>
                      <TableCell>
                        {e.entityName} ({e.entityId.slice(0, 8)})
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={e.action}
                          size="small"
                          color={e.action === "Created" ? "success" : e.action === "Deleted" ? "error" : "info"}
                          variant="outlined"
                        />
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
    </Box>
  );
}
