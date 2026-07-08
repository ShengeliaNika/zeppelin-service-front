import { useState } from "react";
import { Autocomplete, Box, Button, Chip, IconButton, List, ListItem, MenuItem, TextField, Typography } from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlined";
import type { InventoryItem } from "../../../api/types";
import { useAppointmentSupplyUsage, useInventoryItems } from "../../../hooks/queries/useInventory";
import { useLogSuppliesUsed, type SupplyUsageLine } from "../../../hooks/mutations/useInventoryMutations";

interface DraftLine {
  item: InventoryItem;
  quantity: string;
  type: "UsageDeduction" | "Waste";
}

export default function SuppliesUsedPanel({ appointmentId, appointmentTypeId }: { appointmentId: string; appointmentTypeId: string }) {
  const { data: usage } = useAppointmentSupplyUsage(appointmentId);
  const [search, setSearch] = useState("");
  const { data: items } = useInventoryItems(0, 25, "", search);
  const logSupplies = useLogSuppliesUsed(appointmentId, appointmentTypeId);

  const [draft, setDraft] = useState<DraftLine[]>([]);

  function addItem(item: InventoryItem | null) {
    if (!item || draft.some((d) => d.item.id === item.id)) return;
    setDraft((prev) => [...prev, { item, quantity: "1", type: "UsageDeduction" }]);
  }

  function updateLine(itemId: string, patch: Partial<DraftLine>) {
    setDraft((prev) => prev.map((d) => (d.item.id === itemId ? { ...d, ...patch } : d)));
  }

  function removeLine(itemId: string) {
    setDraft((prev) => prev.filter((d) => d.item.id !== itemId));
  }

  async function handleSave() {
    const lines: SupplyUsageLine[] = draft.map((d) => ({ itemId: d.item.id, quantity: Number(d.quantity), type: d.type }));
    await logSupplies.mutateAsync(lines);
    setDraft([]);
  }

  return (
    <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
      {usage && usage.length === 0 && draft.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          Nothing logged for this visit yet.
        </Typography>
      )}

      {usage && usage.length > 0 && (
        <List dense sx={{ mb: 1 }}>
          {usage.map((u) => (
            <ListItem key={u.id} disableGutters sx={{ gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {u.inventoryItemName}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {u.quantity} {u.unit}
              </Typography>
              <Chip size="small" label={u.type === "Waste" ? "Wasted" : "Used"} color={u.type === "Waste" ? "warning" : "default"} />
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {u.recordedByName}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}

      {draft.length > 0 && (
        <List dense sx={{ mb: 1 }}>
          {draft.map((d) => (
            <ListItem key={d.item.id} disableGutters sx={{ gap: 1 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, flex: "1 1 auto" }}>
                {d.item.name}
              </Typography>
              <TextField
                type="number"
                size="small"
                value={d.quantity}
                onChange={(e) => updateLine(d.item.id, { quantity: e.target.value })}
                slotProps={{ htmlInput: { min: 0, step: "any" } }}
                sx={{ width: 90 }}
              />
              <Typography variant="body2" color="text.secondary">
                {d.item.unit}
              </Typography>
              <TextField
                select
                size="small"
                value={d.type}
                onChange={(e) => updateLine(d.item.id, { type: e.target.value as DraftLine["type"] })}
                sx={{ width: 110 }}
              >
                <MenuItem value="UsageDeduction">Used</MenuItem>
                <MenuItem value="Waste">Wasted</MenuItem>
              </TextField>
              <IconButton size="small" onClick={() => removeLine(d.item.id)} aria-label="Remove">
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
            </ListItem>
          ))}
        </List>
      )}

      <Box sx={{ display: "flex", gap: 1, alignItems: "center", flexWrap: "wrap" }}>
        <Autocomplete
          size="small"
          options={items?.items ?? []}
          getOptionLabel={(i) => i.name}
          value={null}
          onChange={(_, value) => addItem(value)}
          onInputChange={(_, value) => setSearch(value)}
          renderInput={(params) => <TextField {...params} placeholder="Add a supply used…" />}
          sx={{ minWidth: 220 }}
        />
        {draft.length > 0 && (
          <Button size="small" variant="contained" onClick={handleSave} disabled={logSupplies.isPending}>
            {logSupplies.isPending ? "Saving…" : "Log Supplies"}
          </Button>
        )}
      </Box>
    </Box>
  );
}
