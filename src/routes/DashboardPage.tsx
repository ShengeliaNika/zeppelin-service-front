import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Card, CardContent, Grid, Link, List, ListItem, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { useDashboardSummary, useCombinedAlerts, useTodaysSchedule } from "../hooks/queries/useAdmin";
import { useDismissRecall } from "../hooks/mutations/useDismissRecall";
import { QueryState } from "../components/QueryState";
import { StatusChip } from "../components/StatusChip";
import { formatCurrency } from "../utils/currency";
import StatTile from "../components/StatTile";

export default function DashboardPage() {
  const { data: summary, isLoading, error } = useDashboardSummary();
  const { data: alerts } = useCombinedAlerts();
  const { data: schedule, isLoading: scheduleLoading } = useTodaysSchedule();
  const dismissRecall = useDismissRecall();

  const hasAlerts = alerts && (alerts.lowStock.length > 0 || alerts.expiringSoon.length > 0 || alerts.recallDue.length > 0);

  const performanceTotal = summary
    ? summary.completedLast7DaysCount + summary.noShowLast7DaysCount + summary.cancelledLast7DaysCount
    : 0;
  const completionRate = performanceTotal > 0 && summary ? Math.round((summary.completedLast7DaysCount / performanceTotal) * 100) : null;

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
        Dashboard
      </Typography>

      <QueryState isLoading={isLoading} error={error}>
        {summary && (
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile label="Today's appointments" value={summary.todaysAppointmentsCount} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile label="This week" value={summary.appointmentsThisWeekCount} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile label="Active patients" value={summary.activePatientsCount} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile
                label="Low stock items"
                value={summary.lowStockCount}
                status={summary.lowStockCount > 0 ? "error" : "success"}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile
                label="Expiring soon"
                value={summary.expiringSoonCount}
                status={summary.expiringSoonCount > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile
                label="Recalls due"
                value={summary.recallDueCount}
                status={summary.recallDueCount > 0 ? "warning" : "success"}
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile label="Est. revenue this month" value={formatCurrency(summary.estimatedRevenueThisMonth)} />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatTile label="Inventory valuation" value={formatCurrency(summary.inventoryValuation)} />
            </Grid>
          </Grid>
        )}
      </QueryState>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Today's Schedule
              </Typography>
              {scheduleLoading && <Typography>Loading…</Typography>}
              {schedule && schedule.length === 0 && <Typography color="text.secondary">No appointments scheduled for today.</Typography>}
              {schedule && schedule.length > 0 && (
                <Paper variant="outlined">
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Time</TableCell>
                          <TableCell>Patient</TableCell>
                          <TableCell>Dentist</TableCell>
                          <TableCell>Type</TableCell>
                          <TableCell>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {schedule.map((a) => (
                          <TableRow key={a.id} hover>
                            <TableCell>{new Date(a.startAtUtc).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</TableCell>
                            <TableCell>
                              <Link component={RouterLink} to={`/patients/${a.patientId}`}>
                                {a.patientName}
                              </Link>
                            </TableCell>
                            <TableCell>{a.dentistName}</TableCell>
                            <TableCell>{a.appointmentTypeName}</TableCell>
                            <TableCell>
                              <StatusChip status={a.status} />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 1.5 }}>
                Performance (last 7 days)
              </Typography>
              {summary && (
                <Box>
                  <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
                    {completionRate !== null ? `${completionRate}%` : "—"}
                    <Typography component="span" variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                      completion rate
                    </Typography>
                  </Typography>
                  <Box sx={{ display: "flex", gap: 3 }}>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Completed
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.completedLast7DaysCount}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        No-shows
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.noShowLast7DaysCount}</Typography>
                    </Box>
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Cancelled
                      </Typography>
                      <Typography sx={{ fontWeight: 600 }}>{summary.cancelledLast7DaysCount}</Typography>
                    </Box>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

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
