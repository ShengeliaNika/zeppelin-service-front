import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Grid,
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
import { useAppointmentsTrend, usePatientGrowth, useRevenueTrend } from "../../hooks/queries/useAnalysis";
import { useUsageCostReport } from "../../hooks/queries/useInventoryReports";
import { QueryState } from "../../components/QueryState";
import StatTile from "../../components/StatTile";
import { formatCurrency } from "../../utils/currency";
import AppointmentsStatusChart from "./components/charts/AppointmentsStatusChart";
import SingleLineChart from "./components/charts/SingleLineChart";
import UsageByCategoryChart from "./components/charts/UsageByCategoryChart";

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function isoDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default function AnalysisPage() {
  const [from, setFrom] = useState(() => isoDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)));
  const [to, setTo] = useState(() => isoDate(new Date()));

  const { data: appointmentsTrend, isLoading: apptLoading, error: apptError } = useAppointmentsTrend(from, to);
  const { data: patientGrowth, isLoading: growthLoading } = usePatientGrowth(from, to);
  const { data: revenueTrend } = useRevenueTrend(6);
  const { data: usageCost, isLoading: usageLoading } = useUsageCostReport(from, to);

  return (
    <Box>
      <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
        Analysis
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Spot gaps, track performance, and see how the practice is growing.
      </Typography>

      <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 3 }}>
        <TextField type="date" size="small" label="From" value={from} onChange={(e) => setFrom(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
        <TextField type="date" size="small" label="To" value={to} onChange={(e) => setTo(e.target.value)} slotProps={{ inputLabel: { shrink: true } }} />
      </Box>

      {/* Appointments */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Appointments
      </Typography>
      <QueryState isLoading={apptLoading} error={apptError}>
        {appointmentsTrend && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatTile label="Completion rate" value={`${appointmentsTrend.completionRate}%`} />
              </Grid>
              <Grid size={{ xs: 6, sm: 3 }}>
                <StatTile
                  label="No-show rate"
                  value={`${appointmentsTrend.noShowRate}%`}
                  status={appointmentsTrend.noShowRate > 10 ? "warning" : "success"}
                />
              </Grid>
            </Grid>
            {appointmentsTrend.daily.length === 0 ? (
              <Typography color="text.secondary" sx={{ mb: 3 }}>
                No appointments in this range.
              </Typography>
            ) : (
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <AppointmentsStatusChart data={appointmentsTrend.daily} />
                </CardContent>
              </Card>
            )}
          </>
        )}
      </QueryState>

      {/* Patient Growth */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Patient Growth
      </Typography>
      {growthLoading && <Typography>Loading…</Typography>}
      {patientGrowth && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatTile label="New patients in range" value={patientGrowth.totalNewPatients} />
            </Grid>
          </Grid>
          {patientGrowth.weekly.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              No new patients in this range.
            </Typography>
          ) : (
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <SingleLineChart
                  data={patientGrowth.weekly.map((w) => ({ label: new Date(w.weekStart).toLocaleDateString(undefined, { month: "short", day: "numeric" }), value: w.newPatients }))}
                  valueLabel="New patients"
                />
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Revenue Trend */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Estimated Revenue Trend (last 6 months)
      </Typography>
      {revenueTrend && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <SingleLineChart
              data={revenueTrend.monthly.map((m) => ({ label: `${MONTH_LABELS[m.month - 1]} ${m.year}`, value: m.estimatedRevenue }))}
              valueLabel="Estimated revenue"
              formatValue={(v) => formatCurrency(v)}
            />
          </CardContent>
        </Card>
      )}

      {/* Inventory Usage & Cost */}
      <Typography variant="h6" sx={{ mb: 1 }}>
        Inventory Usage &amp; Cost
      </Typography>
      {usageLoading && <Typography>Loading…</Typography>}
      {usageCost && usageCost.categoryUsage.length === 0 && (
        <Typography color="text.secondary">Not enough movement history yet to show usage trends.</Typography>
      )}
      {usageCost && usageCost.categoryUsage.length > 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatTile label="Usage cost" value={formatCurrency(usageCost.totalUsageCost)} />
            </Grid>
            <Grid size={{ xs: 6, sm: 3 }}>
              <StatTile label="Waste cost" value={formatCurrency(usageCost.totalWasteCost)} status={usageCost.totalWasteCost > 0 ? "warning" : "success"} />
            </Grid>
          </Grid>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <UsageByCategoryChart data={usageCost.categoryUsage} />
            </CardContent>
          </Card>

          {usageCost.topUsedItems.length > 0 && (
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <Typography sx={{ fontWeight: 600, px: 2, pt: 1.5, pb: 1 }}>Most used items</Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell align="right">Quantity used</TableCell>
                      <TableCell align="right">Estimated cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {usageCost.topUsedItems.map((i) => (
                      <TableRow key={i.inventoryItemId} hover>
                        <TableCell>{i.inventoryItemName}</TableCell>
                        <TableCell align="right">{i.usageQuantity}</TableCell>
                        <TableCell align="right">{formatCurrency(i.estimatedCost)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
