import { useState, type FormEvent } from "react";
import { Box, Button, MenuItem, TextField } from "@mui/material";
import type { StockMovementType } from "../../../api/types";
import { useRecordStockMovement } from "../../../hooks/mutations/useInventoryMutations";

const TYPES: StockMovementType[] = ["Restock", "UsageDeduction", "Waste", "Adjustment"];

export default function StockMovementForm({ itemId }: { itemId: string }) {
  const recordMovement = useRecordStockMovement(itemId);
  const [type, setType] = useState<StockMovementType>("Restock");
  const [quantity, setQuantity] = useState("");
  const [lotNumber, setLotNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await recordMovement.mutateAsync({
      type,
      quantity: Number(quantity),
      lotNumber: type === "Restock" && lotNumber ? lotNumber : undefined,
      expiryDate: type === "Restock" && expiryDate ? expiryDate : undefined,
      notes: notes || undefined,
    });
    setQuantity("");
    setLotNumber("");
    setExpiryDate("");
    setNotes("");
  }

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", alignItems: "center", mt: 1 }}>
      <TextField select size="small" value={type} onChange={(e) => setType(e.target.value as StockMovementType)} sx={{ minWidth: 150 }}>
        {TYPES.map((t) => (
          <MenuItem key={t} value={t}>
            {t}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        type="number"
        size="small"
        slotProps={{ htmlInput: { min: 0, step: "any" } }}
        label={type === "Adjustment" ? "New total" : "Quantity"}
        value={quantity}
        onChange={(e) => setQuantity(e.target.value)}
        required
        sx={{ width: 140 }}
      />
      {type === "Restock" && (
        <>
          <TextField size="small" label="Lot # (optional)" value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} />
          <TextField
            type="date"
            size="small"
            label="Expiry date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
          />
        </>
      )}
      <TextField size="small" label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      <Button type="submit" variant="contained" disabled={recordMovement.isPending}>
        {recordMovement.isPending ? "Saving…" : "Log Movement"}
      </Button>
    </Box>
  );
}
