import { useState } from "react";
import { useParams } from "react-router-dom";
import { Box, Button, List, ListItem, Typography } from "@mui/material";
import { useInventoryItem, useStockMovements } from "../../hooks/queries/useInventory";
import { useUpdateInventoryItem } from "../../hooks/mutations/useInventoryMutations";
import { useAuth } from "../../auth/AuthContext";
import { Roles } from "../../auth/roles";
import { QueryState } from "../../components/QueryState";
import StockMovementForm from "./components/StockMovementForm";
import StockStatusChip from "./components/StockStatusChip";
import ExpiryBadge from "./components/ExpiryBadge";
import ItemSupplierLinksEditor from "./components/ItemSupplierLinksEditor";
import ItemFormDialog from "./components/ItemFormDialog";
import { formatCurrency } from "../../utils/currency";

export default function InventoryItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { data: item, isLoading, error } = useInventoryItem(id);
  const { data: movements, isLoading: movementsLoading } = useStockMovements(id ?? null);
  const updateItem = useUpdateInventoryItem(id ?? "");
  const [showEdit, setShowEdit] = useState(false);

  return (
    <QueryState isLoading={isLoading} error={error}>
      {!item ? (
        <Typography color="error">Inventory item not found.</Typography>
      ) : (
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {item.name}
            </Typography>
            <StockStatusChip currentStock={item.currentStock} parLevel={item.parLevel} />
            {user?.roles.includes(Roles.Admin) && (
              <Button size="small" onClick={() => setShowEdit(true)} sx={{ ml: "auto" }}>
                Edit
              </Button>
            )}
          </Box>
          <Typography color="text.secondary" sx={{ mb: 2 }}>
            {item.category} · {item.currentStock} {item.unit} on hand (par {item.parLevel} {item.unit})
            {item.sku ? ` · SKU: ${item.sku}` : ""}
            {item.isForSale && item.saleFee != null ? ` · Sells for ${formatCurrency(item.saleFee)}` : ""}
            {item.margin != null ? ` · Margin ${formatCurrency(item.margin)}` : ""}
          </Typography>
          {item.notes && (
            <Typography color="text.secondary" sx={{ mb: 2, fontStyle: "italic" }}>
              {item.notes}
            </Typography>
          )}

          <ItemFormDialog
            open={showEdit}
            onClose={() => setShowEdit(false)}
            initialValues={item}
            title="Edit Product"
            submitLabel="Save"
            isSubmitting={updateItem.isPending}
            onSubmit={async (values) => {
              await updateItem.mutateAsync({ ...values, isActive: item.isActive });
              setShowEdit(false);
            }}
          />

          <Typography variant="h6" sx={{ mb: 1 }}>
            Suppliers
          </Typography>
          <ItemSupplierLinksEditor itemId={item.id} suppliers={item.suppliers} />

          <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>
            Batches
          </Typography>
          {item.batches.length === 0 ? (
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              No batches on hand.
            </Typography>
          ) : (
            <List dense sx={{ mb: 2 }}>
              {item.batches.map((b) => (
                <ListItem key={b.id} disableGutters sx={{ display: "flex", gap: 1 }}>
                  <Typography>
                    {b.lotNumber ? `Lot ${b.lotNumber}` : "No lot #"} — {b.quantityRemaining} {item.unit}
                  </Typography>
                  <ExpiryBadge expiryDate={b.expiryDate} />
                </ListItem>
              ))}
            </List>
          )}

          <Typography variant="h6" sx={{ mb: 0.5 }}>
            Log a stock movement
          </Typography>
          <StockMovementForm itemId={item.id} linkedSuppliers={item.suppliers} />

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
                  {m.supplierName && (
                    <Typography color="text.secondary" variant="body2">
                      from {m.supplierName}
                      {m.unitCost != null ? ` @ ${formatCurrency(m.unitCost)}` : ""}
                    </Typography>
                  )}
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
