import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Alert, Box, Button, Link, Paper, TextField, Typography } from "@mui/material";
import * as authApi from "../api/auth";
import { ApiError } from "../api/client";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submittedMessage, setSubmittedMessage] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const response = await authApi.register({ email, password, firstName, lastName });
      setSubmittedMessage(response.message);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not submit your request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
      }}
    >
      <Paper sx={{ p: 4, width: { xs: "100%", sm: 380 }, mx: { xs: 2, sm: 0 }, border: "1px solid", borderColor: "divider" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 3 }}>
          <span style={{ fontSize: 28 }}>🦷</span>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Zeppelin Dental
          </Typography>
        </Box>

        {submittedMessage ? (
          <>
            <Alert severity="success" sx={{ mb: 2 }}>
              {submittedMessage}
            </Alert>
            <Link component={RouterLink} to="/login" underline="hover">
              Back to sign in
            </Link>
          </>
        ) : (
          <>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              Request access. An admin will review and approve your account.
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                label="First name"
                fullWidth
                required
                margin="normal"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                autoFocus
              />
              <TextField label="Last name" fullWidth required margin="normal" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              <TextField
                label="Email"
                type="email"
                fullWidth
                required
                margin="normal"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                label="Password"
                type="password"
                fullWidth
                required
                margin="normal"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {error && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  {error}
                </Alert>
              )}
              <Button type="submit" variant="contained" fullWidth size="large" sx={{ mt: 3 }} disabled={submitting}>
                {submitting ? "Submitting…" : "Request access"}
              </Button>
            </form>
            <Link component={RouterLink} to="/login" underline="hover" sx={{ display: "block", mt: 2, textAlign: "center" }}>
              Already have an account? Sign in
            </Link>
          </>
        )}
      </Paper>
    </Box>
  );
}
