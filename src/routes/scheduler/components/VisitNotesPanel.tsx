import { useState, type FormEvent } from "react";
import { Box, Button, Divider, TextField, Typography } from "@mui/material";
import { useVisitNotes } from "../../../hooks/queries/useClinical";
import { useCreateVisitNote } from "../../../hooks/mutations/useClinicalMutations";

export default function VisitNotesPanel({ appointmentId }: { appointmentId: string }) {
  const { data: notes, isLoading } = useVisitNotes(appointmentId);
  const createNote = useCreateVisitNote(appointmentId);
  const [noteText, setNoteText] = useState("");
  const [proceduresPerformed, setProceduresPerformed] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    await createNote.mutateAsync({ noteText, proceduresPerformed: proceduresPerformed || undefined });
    setNoteText("");
    setProceduresPerformed("");
  }

  return (
    <Box sx={{ bgcolor: "action.hover", borderRadius: 1, p: 1.5 }}>
      {isLoading && <Typography variant="body2">Loading…</Typography>}
      {notes && notes.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
          No visit notes yet.
        </Typography>
      )}
      {notes && notes.length > 0 && (
        <Box sx={{ mb: 1.5 }}>
          {notes.map((n, i) => (
            <Box key={n.id}>
              {i > 0 && <Divider sx={{ my: 1 }} />}
              <Typography variant="body2">{n.noteText}</Typography>
              {n.proceduresPerformed && (
                <Typography variant="body2" color="text.secondary">
                  Procedures: {n.proceduresPerformed}
                </Typography>
              )}
              <Typography variant="caption" color="text.secondary">
                {n.authoredByName} · {new Date(n.createdAtUtc).toLocaleString()}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <TextField
          placeholder="Visit note…"
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          multiline
          minRows={2}
          required
          size="small"
        />
        <TextField
          placeholder="Procedures performed (optional)"
          value={proceduresPerformed}
          onChange={(e) => setProceduresPerformed(e.target.value)}
          size="small"
        />
        <Button type="submit" variant="outlined" size="small" disabled={createNote.isPending} sx={{ alignSelf: "flex-start" }}>
          {createNote.isPending ? "Saving…" : "Add Note"}
        </Button>
      </Box>
    </Box>
  );
}
