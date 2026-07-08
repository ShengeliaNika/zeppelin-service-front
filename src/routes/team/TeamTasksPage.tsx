import { useState, type FormEvent } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useTeamTasks } from "../../hooks/queries/useTeamTasks";
import { useCreateTeamTask, useUpdateTeamTaskStatus } from "../../hooks/mutations/useTeamTaskMutations";
import { useStaffDirectory } from "../../hooks/queries/useScheduling";
import { QueryState } from "../../components/QueryState";
import { StatusChip } from "../../components/StatusChip";
import type { TeamTaskStatus } from "../../api/types";

const STATUS_FILTERS: { value: TeamTaskStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "Open", label: "Open" },
  { value: "InProgress", label: "In Progress" },
  { value: "Done", label: "Done" },
  { value: "Cancelled", label: "Cancelled" },
];

const NEXT_STATUS: Partial<Record<TeamTaskStatus, TeamTaskStatus>> = {
  Open: "InProgress",
  InProgress: "Done",
};

export default function TeamTasksPage() {
  const [scope, setScope] = useState<"mine" | "all">("mine");
  const [statusFilter, setStatusFilter] = useState<TeamTaskStatus | "">("");
  const { data: tasks, isLoading, error } = useTeamTasks(scope === "mine", statusFilter);
  const { data: staff } = useStaffDirectory();
  const createTask = useCreateTeamTask();
  const updateStatus = useUpdateTeamTaskStatus();

  const [showNewTask, setShowNewTask] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedToUserId, setAssignedToUserId] = useState("");
  const [dueDate, setDueDate] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await createTask.mutateAsync({
      title,
      description: description || undefined,
      assignedToUserId,
      dueDate: dueDate || undefined,
    });
    setTitle("");
    setDescription("");
    setAssignedToUserId("");
    setDueDate("");
    setShowNewTask(false);
  }

  function advance(id: string, current: TeamTaskStatus) {
    const next = NEXT_STATUS[current];
    if (next) updateStatus.mutate({ id, status: next });
  }

  function cancel(id: string) {
    updateStatus.mutate({ id, status: "Cancelled" });
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Team
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNewTask(true)}>
          New Task
        </Button>
      </Box>

      <Stack direction="row" spacing={1} sx={{ mb: 1.5 }}>
        <Chip label="My Tasks" clickable color={scope === "mine" ? "primary" : "default"} variant={scope === "mine" ? "filled" : "outlined"} onClick={() => setScope("mine")} />
        <Chip label="All Tasks" clickable color={scope === "all" ? "primary" : "default"} variant={scope === "all" ? "filled" : "outlined"} onClick={() => setScope("all")} />
      </Stack>

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {STATUS_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            size="small"
            clickable
            color={statusFilter === f.value ? "primary" : "default"}
            variant={statusFilter === f.value ? "filled" : "outlined"}
            onClick={() => setStatusFilter(f.value)}
          />
        ))}
      </Stack>

      <Dialog open={showNewTask} onClose={() => setShowNewTask(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={handleCreate}>
          <DialogTitle>New Task</DialogTitle>
          <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 0.5 }}>
            <TextField label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
            <TextField label="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)} multiline minRows={2} />
            <TextField select label="Assign to" value={assignedToUserId} onChange={(e) => setAssignedToUserId(e.target.value)} required>
              {staff?.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.firstName} {s.lastName} ({s.roles.join(", ")})
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              label="Due date (optional)"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={() => setShowNewTask(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={createTask.isPending}>
              {createTask.isPending ? "Creating…" : "Create Task"}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <QueryState isLoading={isLoading} error={error}>
        {tasks && tasks.length === 0 && <Typography color="text.secondary">No tasks here.</Typography>}
        {tasks && tasks.length > 0 && (
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Assigned to</TableCell>
                    <TableCell>Assigned by</TableCell>
                    <TableCell>Due date</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {tasks.map((t) => (
                    <TableRow key={t.id} hover>
                      <TableCell>
                        <Typography sx={{ fontWeight: 600 }}>{t.title}</Typography>
                        {t.description && (
                          <Typography variant="body2" color="text.secondary">
                            {t.description}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>{t.assignedToName}</TableCell>
                      <TableCell>{t.assignedByName}</TableCell>
                      <TableCell>{t.dueDate ?? "—"}</TableCell>
                      <TableCell>
                        <StatusChip status={t.status} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                          {NEXT_STATUS[t.status] && (
                            <Button size="small" onClick={() => advance(t.id, t.status)} disabled={updateStatus.isPending}>
                              Mark {NEXT_STATUS[t.status]}
                            </Button>
                          )}
                          {t.status !== "Done" && t.status !== "Cancelled" && (
                            <Button size="small" color="inherit" onClick={() => cancel(t.id)} disabled={updateStatus.isPending}>
                              Cancel
                            </Button>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </QueryState>
    </Box>
  );
}
