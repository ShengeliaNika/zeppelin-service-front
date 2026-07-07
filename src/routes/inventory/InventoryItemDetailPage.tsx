import { useParams } from "react-router-dom";
import { Box, List, ListItem, Typography } from "@mui/material";
import { useInventoryItem, useStockMovements } from "../../hooks/queries/useInventory";
import { QueryState } from "../../components/QueryState";
import StockMovementForm from "./components/StockMovementForm";

export default function InventoryItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data: item, isLoading, error } = useInventoryItem(id);
  const { data: movements, isLoading: movementsLoading } = useStockMovements(id ?? null);

  return (
    <QueryState isLoading={isLoading} error={error}>
      {!item ? (
        <Typography color="error">Inventory item not found.</Typography>
      ) : (
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            {item.name}
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {item.category} · {item.currentStock} {item.unit} on hand (par {item.parLevel} {item.unit})
            {item.supplierName ? ` · Supplier: ${item.supplierName}` : ""}
          </Typography>

          <Typography variant="h6" sx={{ mb: 1 }}>
            Batches
          </Typography>
          {item.batches.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No batches on hand.
            </Typography>
          ) : (
            <List dense sx={{ mb: 2 }}>
              {item.batches.map((b) => (
                <ListItem key={b.id} disableGutters>
                  {b.lotNumber ? `Lot ${b.lotNumber}` : "No lot #"} — {b.quantityRemaining} {item.unit}
                  {b.expiryDate ? ` — expires ${b.expiryDate}` : ""}
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Log a stock movement
          </Typography>
          <StockMovementForm itemId={item.id} />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            History
          </Typography>
          {movementsLoading && <Typography>Loading…</Typography>}
          {movements && (
            <List dense>
              {movements.map((m) => (
                <ListItem key={m.id} disableGutters sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                  <Typography sx={{ fontWeight: 600, minWidth: 120 }}>{m.type}</Typography>
                  <Typography>
                    {m.quantity} {item.unit}
                  </Typography>
                  {m.notes && (
                    <Typography color="text.secondary" sx={{ fontStyle: "italic" }}>
                      — {m.notes}
                    </Typography>
                  )}
                  <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                    {m.recordedByName} · {new Date(m.recordedAtUtc).toLocaleString()}
                  </Typography>
                </ListItem>
              ))}
            </List>
          )}
        </Box>
      )}
    </QueryState>
  );
}
