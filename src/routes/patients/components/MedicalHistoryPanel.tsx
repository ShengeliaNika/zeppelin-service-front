import { useState, type FormEvent } from "react";
import { Box, Chip, List, ListItem, MenuItem, TextField, Typography, Button } from "@mui/material";
import type { MedicalHistoryEntry, MedicalHistoryType } from "../../../api/types";
import { useAddMedicalHistoryEntry } from "../../../hooks/mutations/usePatientMutations";

const TYPES: MedicalHistoryType[] = ["Allergy", "Medication", "Condition"];

const TYPE_COLOR: Record<MedicalHistoryType, "error" | "warning" | "info"> = {
  Allergy: "error",
  Medication: "warning",
  Condition: "info",
};

export default function MedicalHistoryPanel({ patientId, entries }: { patientId: string; entries: MedicalHistoryEntry[] }) {
  const addEntry = useAddMedicalHistoryEntry(patientId);
  const [type, setType] = useState<MedicalHistoryType>("Allergy");
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await addEntry.mutateAsync({ type, description, severity: severity || undefined });
    setDescription("");
    setSeverity("");
  }

  return (
    <Box>
      {entries.length === 0 ? (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No medical history recorded.
        </Typography>
      ) : (
        <List sx={{ mb: 2 }}>
          {entries.map((entry) => (
            <ListItem key={entry.id} disableGutters sx={{ gap: 1 }}>
              <Chip label={entry.type} size="small" color={TYPE_COLOR[entry.type]} variant="outlined" />
              <Typography>{entry.description}</Typography>
              {entry.severity && (
                <Typography variant="body2" color="text.secondary">
                  ({entry.severity})
                </Typography>
              )}
            </ListItem>
          ))}
        </List>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", gap: 1, flexWrap: "wrap", alignItems: "center" }}>
        <TextField select size="small" value={type} onChange={(e) => setType(e.target.value as MedicalHistoryType)} sx={{ minWidth: 140 }}>
          {TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          size="small"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        <TextField size="small" placeholder="Severity (optional)" value={severity} onChange={(e) => setSeverity(e.target.value)} />
        <Button type="submit" variant="outlined" disabled={addEntry.isPending}>
          {addEntry.isPending ? "Adding…" : "Add"}
        </Button>
      </Box>
    </Box>
  );
}
