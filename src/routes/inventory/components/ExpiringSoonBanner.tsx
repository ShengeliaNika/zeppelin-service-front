import { Link as RouterLink } from "react-router-dom";
import { Alert, Link } from "@mui/material";
import type { ExpiringBatch } from "../../../api/types";

export default function ExpiringSoonBanner({ batches }: { batches: ExpiringBatch[] }) {
  if (batches.length === 0) return null;

  return (
    <Alert severity="warning" sx={{ mb: 1.5 }}>
      <strong>Expiring soon:</strong>{" "}
      {batches.map((b, i) => (
        <span key={b.batchId}>
          <Link component={RouterLink} to={`/inventory/${b.inventoryItemId}`}>
            {b.inventoryItemName}
            {b.lotNumber ? ` (lot ${b.lotNumber})` : ""} on {b.expiryDate}
          </Link>
          {i < batches.length - 1 ? ", " : ""}
        </span>
      ))}
    </Alert>
  );
}
