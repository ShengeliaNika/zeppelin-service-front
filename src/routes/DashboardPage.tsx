import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Grid, Link, List, ListItem, Typography } from "@mui/material";
import { useDashboardSummary, useCombinedAlerts } from "../hooks/queries/useAdmin";
import { useDismissRecall } from "../hooks/mutations/useDismissRecall";
import { QueryState } from "../components/QueryState";
import StatTile from "../components/StatTile";

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useDashboardSummary();
  const { data: alerts } = useCombinedAlerts();
  const dismissRecall = useDismissRecall();

  const hasAlerts = alerts && (alerts.lowStock.length > 0 || alerts.expiringSoon.length > 0 || alerts.recallDue.length > 0);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Dashboard
      </Typography>

      <QueryState isLoading={isLoading} error={error}>
        {summary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile label="Today's appointments" value={summary.todaysAppointmentsCount} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile label="This week" value={summary.appointmentsThisWeekCount} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile label="Active patients" value={summary.activePatientsCount} />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile
                label="Low stock items"
                value={summary.lowStockCount}
                status={summary.lowStockCount > 0 ? "error" : "success"}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile
                label="Expiring soon"
                value={summary.expiringSoonCount}
                status={summary.expiringSoonCount > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid size={{ xs: 6, sm: 4, md: 2 }}>
              <StatTile
                label="Recalls due"
                value={summary.recallDueCount}
                status={summary.recallDueCount > 0 ? "warning" : "success"}
              />
            </Grid>
          </Grid>
        )}
      </QueryState>

      {hasAlerts && (
        <Card sx={{ maxWidth: 680 }}>
          <CardContent>
            <Typography variant="h6" sx={{ mb: 1.5 }}>
              Alerts
            </Typography>

            {alerts.lowStock.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Low stock
                </Typography>
                <List dense disablePadding>
                  {alerts.lowStock.map((item) => (
                    <ListItem key={item.id} disableGutters>
                      <Link component={RouterLink} to={`/inventory/${item.id}`}>
                        {item.name} — {item.currentStock} {item.unit} (par {item.parLevel})
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {alerts.expiringSoon.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Expiring soon
                </Typography>
                <List dense disablePadding>
                  {alerts.expiringSoon.map((b) => (
                    <ListItem key={b.batchId} disableGutters>
                      <Link component={RouterLink} to={`/inventory/${b.inventoryItemId}`}>
                        {b.inventoryItemName}
                        {b.lotNumber ? ` (lot ${b.lotNumber})` : ""} — expires {b.expiryDate}
                      </Link>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {alerts.recallDue.length > 0 && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                  Recalls due
                </Typography>
                <List dense disablePadding>
                  {alerts.recallDue.map((r) => (
                    <ListItem key={r.id} disableGutters sx={{ justifyContent: "space-between" }}>
                      <Link component={RouterLink} to={`/patients/${r.patientId}`}>
                        {r.patientName} — {r.appointmentTypeName} due {r.dueDate}
                      </Link>
                      <Button size="small" onClick={() => dismissRecall.mutate(r.id)} disabled={dismissRecall.isPending}>
                        Dismiss
                      </Button>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
