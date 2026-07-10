import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useUsers } from "../../hooks/queries/useUsers";
import { useCreateUser } from "../../hooks/mutations/useCreateUser";
import { useApproveUser } from "../../hooks/mutations/useApproveUser";
import { useDeclineUser } from "../../hooks/mutations/useDeclineUser";
import { AllRoles } from "../../auth/roles";
import { QueryState } from "../../components/QueryState";
import type { StaffUser } from "../../api/types";

function statusColor(user: StaffUser): "success" | "default" | "error" {
  if (user.approvalStatus === "Declined") return "error";
  if (user.approvalStatus === "Pending") return "default";
  return user.isActive ? "success" : "default";
}

function statusLabel(user: StaffUser): string {
  if (user.approvalStatus === "Pending") return "Pending";
  if (user.approvalStatus === "Declined") return "Declined";
  return user.isActive ? "Active" : "Inactive";
}

function PendingRequestRow({ user }: { user: StaffUser }) {
  const [role, setRole] = useState<string>(AllRoles[1]);
  const approveUser = useApproveUser();
  const declineUser = useDeclineUser();
  const busy = approveUser.isPending || declineUser.isPending;

  return (
    <TableRow hover>
      <TableCell>
        {user.firstName} {user.lastName}
      </TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>
        <TextField select size="small" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 130 }}>
          {AllRoles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
      </TableCell>
      <TableCell align="right">
        <Button
          size="small"
          variant="contained"
          disabled={busy}
          onClick={() => approveUser.mutate({ id: user.id, request: { roles: [role] } })}
          sx={{ mr: 1 }}
        >
          Approve
        </Button>
        <Button size="small" variant="outlined" color="error" disabled={busy} onClick={() => declineUser.mutate(user.id)}>
          Decline
        </Button>
      </TableCell>
    </TableRow>
  );
}

export default function UsersPage() {
  const { data: users, isLoading, error } = useUsers();
  const createUser = useCreateUser();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState<string>(AllRoles[1]);

  const pendingUsers = users?.filter((u) => u.approvalStatus === "Pending") ?? [];

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createUser.mutateAsync({ email, password, firstName, lastName, roles: [role] });
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Staff
      </Typography>

      <QueryState isLoading={isLoading} error={error}>
        {pendingUsers.length > 0 && (
          <>
            <Typography variant="h6" sx={{ mb: 1 }}>
              Pending requests
            </Typography>
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role to assign</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {pendingUsers.map((u) => (
                      <PendingRequestRow key={u.id} user={u} />
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </>
        )}

        {users && (
          <Paper variant="outlined" sx={{ mb: 3 }}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Roles</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>
                        {u.firstName} {u.lastName}
                      </TableCell>
                      <TableCell>{u.email}</TableCell>
                      <TableCell>{u.roles.join(", ")}</TableCell>
                      <TableCell>
                        <Chip label={statusLabel(u)} size="small" color={statusColor(u)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        )}
      </QueryState>

      <Typography variant="h6" sx={{ mb: 1 }}>
        Add staff member
      </Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField size="small" label="First name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        <TextField size="small" label="Last name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        <TextField size="small" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <TextField
          size="small"
          type="password"
          label="Temporary password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <TextField select size="small" label="Role" value={role} onChange={(e) => setRole(e.target.value)} sx={{ minWidth: 130 }}>
          {AllRoles.map((r) => (
            <MenuItem key={r} value={r}>
              {r}
            </MenuItem>
          ))}
        </TextField>
        <Button type="submit" variant="contained" disabled={createUser.isPending}>
          {createUser.isPending ? "Adding…" : "Add"}
        </Button>
      </Box>
      {createUser.isError && (
        <Alert severity="error" sx={{ mt: 2, maxWidth: 400 }}>
          Failed to create user.
        </Alert>
      )}
    </Box>
  );
}
