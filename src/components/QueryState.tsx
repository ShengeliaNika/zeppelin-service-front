import { Alert, Box, CircularProgress } from "@mui/material";
import type { ReactNode } from "react";

interface QueryStateProps {
  isLoading: boolean;
  error: unknown;
  children: ReactNode;
}

// Wraps the common "loading spinner / error alert / content" branching that every
// react-query-backed page needs, so individual pages only render the happy path.
export function QueryState({ isLoading, error, children }: QueryStateProps) {
  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return <Alert severity="error">{error instanceof Error ? error.message : "Something went wrong."}</Alert>;
  }
  return <>{children}</>;
}
