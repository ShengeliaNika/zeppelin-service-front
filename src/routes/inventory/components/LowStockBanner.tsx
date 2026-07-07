import { Link as RouterLink } from "react-router-dom";
import { Alert, Link } from "@mui/material";
import type { InventoryItem } from "../../../api/types";

export default function LowStockBanner({ items }: { items: InventoryItem[] }) {
  if (items.length === 0) return null;

  return (
    <Alert severity="error" sx={{ mb: 1.5 }}>
      <strong>Low stock:</strong>{" "}
      {items.map((item, i) => (
        <span key={item.id}>
          <Link component={RouterLink} to={`/inventory/${item.id}`}>
            {item.name} ({item.currentStock} {item.unit})
          </Link>
          {i < items.length - 1 ? ", " : ""}
        </span>
      ))}
    </Alert>
  );
}
