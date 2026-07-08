import { useTheme } from "@mui/material";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CHART_TOKENS } from "./chartTokens";

export default function SingleLineChart({
  data,
  valueLabel,
  formatValue,
}: {
  data: { label: string; value: number }[];
  valueLabel: string;
  formatValue?: (value: number) => string;
}) {
  const theme = useTheme();
  const tokens = CHART_TOKENS[theme.palette.mode];
  const format = formatValue ?? ((v: number) => String(v));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid vertical={false} stroke={tokens.grid} />
        <XAxis dataKey="label" tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={{ stroke: tokens.grid }} tickLine={false} />
        <YAxis tick={{ fill: tokens.axis, fontSize: 12 }} axisLine={false} tickLine={false} width={56} tickFormatter={format} />
        <Tooltip
          contentStyle={{ background: theme.palette.background.paper, border: `1px solid ${tokens.grid}`, borderRadius: 8 }}
          labelStyle={{ color: tokens.text }}
          formatter={(value) => [format(Number(value)), valueLabel]}
        />
        <Line
          type="monotone"
          dataKey="value"
          stroke={tokens.usage}
          strokeWidth={2}
          dot={{ r: 4, fill: tokens.usage, strokeWidth: 2, stroke: theme.palette.background.paper }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
