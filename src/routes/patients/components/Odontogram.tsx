import { useState, type FormEvent } from "react";
import { Box, Button, Card, CardContent, MenuItem, TextField, Typography } from "@mui/material";
import type { ToothStatus } from "../../../api/types";
import { useToothRecords } from "../../../hooks/queries/useClinical";
import { useUpsertToothRecord } from "../../../hooks/mutations/useClinicalMutations";

const STATUSES: ToothStatus[] = ["Healthy", "Decayed", "Filled", "Crowned", "RootCanal", "Missing", "Implant", "Extracted"];

const UPPER_TEETH = Array.from({ length: 16 }, (_, i) => i + 1); // 1-16
const LOWER_TEETH = Array.from({ length: 16 }, (_, i) => 32 - i); // 32-17

const STATUS_COLOR: Record<ToothStatus, string> = {
  Healthy: "#ffffff",
  Decayed: "#e74c3c",
  Filled: "#f1c40f",
  Crowned: "#f39c12",
  RootCanal: "#9b59b6",
  Missing: "#ccc",
  Implant: "#3498db",
  Extracted: "#ccc",
};

export default function Odontogram({ patientId }: { patientId: string }) {
  const { data: records } = useToothRecords(patientId);
  const upsert = useUpsertToothRecord(patientId);
  const [selectedTooth, setSelectedTooth] = useState<number | null>(null);
  const [status, setStatus] = useState<ToothStatus>("Healthy");
  const [surface, setSurface] = useState("");
  const [notes, setNotes] = useState("");

  const recordByTooth = new Map((records ?? []).map((r) => [r.toothNumber, r]));

  function selectTooth(tooth: number) {
    setSelectedTooth(tooth);
    const existing = recordByTooth.get(tooth);
    setStatus(existing?.status ?? "Healthy");
    setSurface(existing?.surface ?? "");
    setNotes(existing?.notes ?? "");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (selectedTooth === null) return;
    await upsert.mutateAsync({ toothNumber: selectedTooth, status, surface: surface || undefined, notes: notes || undefined });
    setSelectedTooth(null);
  }

  function renderRow(teeth: number[]) {
    return (
      <Box sx={{ overflowX: "auto", pb: 0.5 }}>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.75, width: "fit-content" }}>
          {teeth.map((n) => {
            const record = recordByTooth.get(n);
            const color = STATUS_COLOR[record?.status ?? "Healthy"];
            return (
              <Box
                key={n}
                component="button"
                type="button"
                onClick={() => selectTooth(n)}
                title={record ? `${n}: ${record.status}` : `${n}: Healthy`}
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: color,
                  color: ["Decayed", "Crowned", "RootCanal", "Implant"].includes(record?.status ?? "") ? "white" : "text.primary",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  outline: selectedTooth === n ? "2px solid" : "none",
                  outlineColor: "primary.main",
                }}
              >
                {n}
              </Box>
            );
          })}
        </Box>
      </Box>
    );
  }

  return (
    <Box>
      {renderRow(UPPER_TEETH)}
      {renderRow(LOWER_TEETH)}

      {selectedTooth !== null && (
        <Card sx={{ mt: 2, maxWidth: 320 }}>
          <CardContent>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Tooth {selectedTooth}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
              <TextField select label="Status" size="small" value={status} onChange={(e) => setStatus(e.target.value as ToothStatus)}>
                {STATUSES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </TextField>
              <TextField label="Surface" size="small" value={surface} onChange={(e) => setSurface(e.target.value)} placeholder="e.g. Occlusal" />
              <TextField label="Notes" size="small" value={notes} onChange={(e) => setNotes(e.target.value)} multiline minRows={2} />
              <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1 }}>
                <Button onClick={() => setSelectedTooth(null)}>Cancel</Button>
                <Button type="submit" variant="contained" disabled={upsert.isPending}>
                  {upsert.isPending ? "Saving…" : "Save"}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
