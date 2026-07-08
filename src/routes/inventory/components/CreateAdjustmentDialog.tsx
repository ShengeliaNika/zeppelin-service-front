import { useState, type FormEvent } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import type { InventoryItem } from "../../../api/types";
import { useInventoryItems } from "../../../hooks/queries/useInventory";
import { useBulkAdjustment, type BulkAdjustmentLine } from "../../../hooks/mutations/useInventoryMutations";

interface DraftLine {
  item: InventoryItem;
  newQuantity: string;
}

export default function CreateAdjustmentDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data } = useInventoryItems(0, 100);
  const bulkAdjustment = useBulkAdjustment();
  const [notes, setNotes] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([]);

  const allItems = data?.items ?? [];
  const addableItems = allItems.filter((i) => !lines.some((l) => l.item.id === i.id));

  function addItem(item: InventoryItem | null) {
    if (!item) return;
    setLines((prev) => [...prev, { item, newQuantity: String(item.currentStock) }]);
  }

  function updateQuantity(itemId: string, value: string) {
    setLines((prev) => prev.map((l) => (l.item.id === itemId ? { ...l, newQuantity: value } : l)));
  }

  function removeLine(itemId: string) {
    setLines((prev) => prev.filter((l) => l.item.id !== itemId));
  }

  function handleClose() {
    setLines([]);
    setNotes("");
    onClose();
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const payload: BulkAdjustmentLine[] = lines.map((l) => ({ itemId: l.item.id, newQuantity: Number(l.newQuantity), notes: notes || undefined }));
    await bulkAdjustment.mutateAsync(payload);
    handleClose();
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle>Create Adjustment</DialogTitle>
        <DialogContent>
          <Autocomplete
            options={addableItems}
            getOptionLabel={(i) => i.name}
            onChange={(_, value) => addItem(value)}
            value={null}
            renderInput={(params) => <TextField {...params} label="Add product" size="small" sx={{ mb: 2 }} />}
          />

          {lines.length === 0 ? (
            <Typography color="text.secondary">No products added yet.</Typography>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">In stock</TableCell>
                  <TableCell align="right">New stock</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {lines.map((l) => (
                  <TableRow key={l.item.id}>
                    <TableCell>{l.item.name}</TableCell>
                    <TableCell align="right">
                      {l.item.currentStock} {l.item.unit}
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        type="number"
                        size="small"
                        value={l.newQuantity}
                        onChange={(e) => updateQuantity(l.item.id, e.target.value)}
                        slotProps={{ htmlInput: { min: 0, step: "any" } }}
                        sx={{ width: 100 }}
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" onClick={() => removeLine(l.item.id)} aria-label="Remove">
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <TextField
            size="small"
            label="Note (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={lines.length === 0 || bulkAdjustment.isPending}>
            {bulkAdjustment.isPending ? "Saving…" : "Create Adjustment"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
