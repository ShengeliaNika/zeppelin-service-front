import { useTheme } from "@mui/material";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { CategoryUsage } from "../../../../api/types";
import { CHART_TOKENS } from "./chartTokens";

export default function UsageByCategoryChart({ data }: { data: CategoryUsage[] }) {
  const theme = useTheme();
  const tokens = CHART_TOKENS[theme.palette.mode];

  const chartData = data.map((c) => ({ category: c.category, Usage: c.usageQuantity, Waste: c.wasteQuantity }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} barGap={2} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke={tokens.grid} />
        <XAxis dataKey="category" tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={{ stroke: tokens.grid }} tickLine={false} />
        <YAxis tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={48} />
        <Tooltip
          contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${tokens.grid}`, borderRadius: 8 }}
          labelStyle={{ color: tokens.text }}
        />
        <Legend wrapperStyle={{ fontSize: 12, color: tokens.text }} />
        <Bar dataKey="Usage" fill={tokens.usage} radius={[4, 4, 0, 0]} maxBarSize={24} />
        <Bar dataKey="Waste" fill={tokens.waste} radius={[4, 4, 0, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
