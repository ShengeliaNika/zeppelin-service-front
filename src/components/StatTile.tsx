import { Card, CardContent, Box, Typography } from "@mui/material";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";

type Status = "success" | "warning" | "error";

const STATUS_ICON: Record<Status, typeof CheckCircleOutlinedIcon> = {
  success: CheckCircleOutlinedIcon,
  warning: WarningAmberOutlinedIcon,
  error: ErrorOutlinedIcon,
};

interface Props {
  label: string;
  value: number | string;
  status?: Status;
}

export default function StatTile({ label, value, status }: Props) {
  const Icon = status ? STATUS_ICON[status] : undefined;

  return (
    <Card sx={{ minWidth: 160 }}>
      <CardContent>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {label}
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.5 }}>
          {Icon && <Icon fontSize="small" color={status} />}
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {value}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
