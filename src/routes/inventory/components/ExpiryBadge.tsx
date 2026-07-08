import { Chip } from "@mui/material";

export default function ExpiryBadge({ expiryDate }: { expiryDate: string | null }) {
  if (!expiryDate) return null;

  const daysLeft = Math.ceil((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) {
    return <Chip size="small" color="error" label="Expired" />;
  }
  if (daysLeft <= 30) {
    return <Chip size="small" color="warning" label={daysLeft === 0 ? "Expires today" : `Expires in ${daysLeft}d`} />;
  }
  return <Chip size="small" variant="outlined" label={`Expires ${expiryDate}`} />;
}
