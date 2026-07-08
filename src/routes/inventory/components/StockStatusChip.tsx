import { Chip } from "@mui/material";

export default function StockStatusChip({ currentStock, parLevel }: { currentStock: number; parLevel: number }) {
  if (currentStock <= 0) {
    return <Chip size="small" color="error" label="Out of stock" />;
  }
  if (currentStock <= parLevel) {
    return <Chip size="small" color="warning" label="Low stock" />;
  }
  return <Chip size="small" color="success" label="OK" />;
}
