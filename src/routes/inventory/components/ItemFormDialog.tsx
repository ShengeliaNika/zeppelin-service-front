import { useMemo, useState, type FormEvent } from "react";
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Stack, Switch, TextField, Typography } from "@mui/material";
import type { CreateInventoryItemRequest, InventoryCategory, InventoryItem, InventorySaleType } from "../../../api/types";

const CATEGORIES: InventoryCategory[] = ["Consumable", "Anesthetic", "Ppe", "Instrument", "Other"];
const SALE_TYPES: { value: InventorySaleType; label: string }[] = [
  { value: "ForDoctor", label: "For Doctor" },
  { value: "ForPatient", label: "For Patient" },
];

// 3-equal-column row, matching the reference product form's grid.
function FieldRow({ children }: { children: React.ReactNode }) {
  return <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr 1fr" }, gap: 1.5 }}>{children}</Box>;
}

export default function ItemFormDialog({
  open,
  onClose,
  initialValues,
  title,
  submitLabel,
  isSubmitting,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  initialValues?: InventoryItem;
  title: string;
  submitLabel: string;
  isSubmitting: boolean;
  onSubmit: (values: CreateInventoryItemRequest) => Promise<unknown>;
}) {
  const [name, setName] = useState(initialValues?.name ?? "");
  const [category, setCategory] = useState<InventoryCategory>(initialValues?.category ?? "Consumable");
  const [unit, setUnit] = useState(initialValues?.unit ?? "");
  const [sku, setSku] = useState(initialValues?.sku ?? "");
  const [isForSale, setIsForSale] = useState(initialValues?.isForSale ?? false);
  const [purchaseFee, setPurchaseFee] = useState(initialValues?.purchaseFee != null ? String(initialValues.purchaseFee) : "");
  const [saleFee, setSaleFee] = useState(initialValues?.saleFee != null ? String(initialValues.saleFee) : "");
  const [dimensions, setDimensions] = useState(initialValues?.dimensions ?? "");
  const [packageValue, setPackageValue] = useState(initialValues?.package ?? "");
  const [saleType, setSaleType] = useState<InventorySaleType>(initialValues?.saleType ?? "ForDoctor");
  const [weight, setWeight] = useState(initialValues?.weight != null ? String(initialValues.weight) : "");
  const [parLevel, setParLevel] = useState(String(initialValues?.parLevel ?? ""));
  const [reorderQuantity, setReorderQuantity] = useState(initialValues?.reorderQuantity != null ? String(initialValues.reorderQuantity) : "");
  const [notes, setNotes] = useState(initialValues?.notes ?? "");

  const saleMarginPercent = useMemo(() => {
    const cost = Number(purchaseFee) || 0;
    const price = Number(saleFee) || 0;
    if (!isForSale || price <= 0) return 0;
    return ((price - cost) / price) * 100;
  }, [purchaseFee, saleFee, isForSale]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await onSubmit({
      name,
      category,
      unit,
      sku: sku || undefined,
      notes: notes || undefined,
      parLevel: Number(parLevel),
      reorderQuantity: reorderQuantity ? Number(reorderQuantity) : undefined,
      isForSale,
      purchaseFee: purchaseFee ? Number(purchaseFee) : undefined,
      saleFee: isForSale && saleFee ? Number(saleFee) : undefined,
      saleType: isForSale ? saleType : undefined,
      package: packageValue || undefined,
      dimensions: dimensions || undefined,
      weight: weight ? Number(weight) : undefined,
    });
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <Stack spacing={2} sx={{ mt: 0.5 }}>
            <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
              <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} required sx={{ flex: "1 1 200px" }} />
              <TextField size="small" label="Code / SKU" value={sku} onChange={(e) => setSku(e.target.value)} sx={{ width: 140 }} />
              <TextField size="small" label="Unit (e.g. box)" value={unit} onChange={(e) => setUnit(e.target.value)} required sx={{ width: 140 }} />
            </Box>

            <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value as InventoryCategory)} sx={{ minWidth: 200 }}>
              {CATEGORIES.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </TextField>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Switch checked={isForSale} onChange={(e) => setIsForSale(e.target.checked)} />
              <Typography>This product is for sale</Typography>
            </Box>

            <FieldRow>
              <TextField
                type="number"
                size="small"
                label="Purchase Fee (GEL)"
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                value={purchaseFee}
                onChange={(e) => setPurchaseFee(e.target.value)}
              />
              <TextField
                type="number"
                size="small"
                label="Sale Fee (GEL)"
                disabled={!isForSale}
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                value={saleFee}
                onChange={(e) => setSaleFee(e.target.value)}
              />
              <TextField size="small" label="Dimensions (L x W x H)" value={dimensions} onChange={(e) => setDimensions(e.target.value)} />
            </FieldRow>

            <FieldRow>
              <TextField size="small" label="Package" value={packageValue} onChange={(e) => setPackageValue(e.target.value)} />
              <TextField
                select
                size="small"
                label="Sale Type"
                disabled={!isForSale}
                value={saleType}
                onChange={(e) => setSaleType(e.target.value as InventorySaleType)}
              >
                {SALE_TYPES.map((t) => (
                  <MenuItem key={t.value} value={t.value}>
                    {t.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                type="number"
                size="small"
                label="Weight (kg)"
                slotProps={{ htmlInput: { min: 0, step: "0.01" } }}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </FieldRow>

            <FieldRow>
              <TextField
                type="number"
                size="small"
                label="Par level"
                slotProps={{ htmlInput: { min: 0 } }}
                value={parLevel}
                onChange={(e) => setParLevel(e.target.value)}
                required
              />
              <TextField
                type="number"
                size="small"
                label="Reorder qty (optional)"
                slotProps={{ htmlInput: { min: 0 } }}
                value={reorderQuantity}
                onChange={(e) => setReorderQuantity(e.target.value)}
              />
              <TextField size="small" label="Sale Margin" value={`${saleMarginPercent.toFixed(2)}%`} disabled />
            </FieldRow>

            <TextField size="small" label="Note (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            {isSubmitting ? "Saving…" : submitLabel}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
