import { useTheme } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { DailyAppointmentStats } from "../../../../api/types";
import { CHART_TOKENS } from "./chartTokens";

export default function AppointmentsStatusChart({ data }: { data: DailyAppointmentStats[] }) {
  const theme = useTheme();
  const tokens = CHART_TOKENS[theme.palette.mode];

  const chartData = data.map((d) => ({
    date: new Date(d.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
    Scheduled: d.scheduled,
    Completed: d.completed,
    "No-show": d.noShow,
    Cancelled: d.cancelled,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} barGap={2} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={tokens.grid} />
        <XAxis dataKey="date" tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={{ stroke: tokens.grid }} tickLine={false} />
        <YAxis tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={40} allowDecimals={false} />
        <Tooltip
          contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${tokens.grid}`, borderRadius: 8 }}
          labelStyle={{ color: tokens.text }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: tokens.text }} />
        <Bar dataKey="Scheduled" stackId="s" fill={tokens.slot1} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Completed" stackId="s" fill={tokens.slot2} radius={[0, 0, 0, 0]} />
        <Bar dataKey="No-show" stackId="s" fill={tokens.slot3} radius={[0, 0, 0, 0]} />
        <Bar dataKey="Cancelled" stackId="s" fill={tokens.slot4} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
