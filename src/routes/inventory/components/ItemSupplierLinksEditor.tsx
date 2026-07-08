import { useState, type FormEvent } from "react";
import { Box, Button, Chip, IconButton, List, ListItem, MenuItem, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import type { ItemSupplierLink } from "../../../api/types";
import { useSuppliers } from "../../../hooks/queries/useSuppliers";
import { useCreateSupplier } from "../../../hooks/mutations/useSupplierMutations";
import { useLinkItemSupplier, useUnlinkItemSupplier } from "../../../hooks/mutations/useItemSupplierMutations";
import { formatCurrency } from "../../../utils/currency";

const NEW_SUPPLIER_VALUE = "__new__";

export default function ItemSupplierLinksEditor({ itemId, suppliers }: { itemId: string; suppliers: ItemSupplierLink[] }) {
  const { data: allSuppliers } = useSuppliers();
  const createSupplier = useCreateSupplier();
  const linkSupplier = useLinkItemSupplier(itemId);
  const unlinkSupplier = useUnlinkItemSupplier(itemId);

  const [supplierId, setSupplierId] = useState("");
  const [newSupplierName, setNewSupplierName] = useState("");
  const [lastUnitCost, setLastUnitCost] = useState("");

  const linkableSuppliers = (allSuppliers ?? []).filter((s) => !suppliers.some((link) => link.supplierId === s.id));
  const isCreatingNew = supplierId === NEW_SUPPLIER_VALUE;

  async function handleLink(e: FormEvent) {
    e.preventDefault();
    if (!supplierId) return;

    const resolvedSupplierId = isCreatingNew ? (await createSupplier.mutateAsync({ name: newSupplierName })).id : supplierId;

    await linkSupplier.mutateAsync({
      supplierId: resolvedSupplierId,
      lastUnitCost: lastUnitCost ? Number(lastUnitCost) : undefined,
      isPreferred: suppliers.length === 0,
    });
    setSupplierId("");
    setNewSupplierName("");
    setLastUnitCost("");
  }

  return (
    <Box>
      {suppliers.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          No suppliers linked yet.
        </Typography>
      ) : (
        <List dense sx={{ mb: 1 }}>
          {suppliers.map((link) => (
            <ListItem
              key={link.id}
              disableGutters
              secondaryAction={
                <IconButton edge="end" size="small" onClick={() => unlinkSupplier.mutate(link.id)} aria-label="Unlink supplier">
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              }
            >
              <Typography sx={{ fontWeight: 600, mr: 1 }}>{link.supplierName}</Typography>
              {link.isPreferred && <Chip size="small" color="primary" label="Preferred" sx={{ mr: 1 }} />}
              {link.lastUnitCost != null && (
                <Typography color="text.secondary" variant="body2">
                  last cost {formatCurrency(link.lastUnitCost)}
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Box component="form" onSubmit={handleLink} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center" }}>
        <TextField select size="small" label="Supplier" value={supplierId} onChange={(e) => setSupplierId(e.target.value)} sx={{ minWidth: 180 }}>
          {linkableSuppliers.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
          <MenuItem value={NEW_SUPPLIER_VALUE}>+ New supplier…</MenuItem>
        </TextField>
        {isCreatingNew && (
          <TextField size="small" label="New supplier name" value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} required />
        )}
        <TextField
          type="number"
          size="small"
          label="Cost (GEL, optional)"
          slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
          value={lastUnitCost}
          onChange={(e) => setLastUnitCost(e.target.value)}
          sx={{ width: 140 }}
        />
        <Button
          type="submit"
          variant="outlined"
          disabled={!supplierId || (isCreatingNew && !newSupplierName) || linkSupplier.isPending || createSupplier.isPending}
        >
          Link
        </Button>
      </Box>
    </Box>
  );
}
