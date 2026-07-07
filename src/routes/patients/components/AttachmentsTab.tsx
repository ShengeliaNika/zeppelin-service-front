import { useRef, useState } from "react";
import { Alert, Box, Button, Chip, List, ListItem, Link, MenuItem, TextField, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import type { AttachmentType } from "../../../api/types";
import { useAttachments } from "../../../hooks/queries/useClinical";
import { useUploadAttachment } from "../../../hooks/mutations/useClinicalMutations";
import { apiFetchBlob } from "../../../api/client";

const TYPES: AttachmentType[] = ["Xray", "Photo", "ConsentForm", "Other"];

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AttachmentsTab({ patientId }: { patientId: string }) {
  const { data: attachments, isLoading } = useAttachments(patientId);
  const uploadAttachment = useUploadAttachment(patientId);
  const [type, setType] = useState<AttachmentType>("Xray");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    await uploadAttachment.mutateAsync({ file, type });
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleDownload(id: string, fileName: string) {
    setDownloadError(null);
    try {
      const blob = await apiFetchBlob(`/api/attachments/${id}/download`);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setDownloadError("Failed to download file.");
    }
  }

  return (
    <Box>
      {isLoading && <Typography>Loading…</Typography>}
      {attachments && attachments.length === 0 && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No attachments yet.
        </Typography>
      )}
      {attachments && attachments.length > 0 && (
        <List sx={{ mb: 2 }}>
          {attachments.map((a) => (
            <ListItem key={a.id} disableGutters sx={{ gap: 1.5 }}>
              <Chip label={a.type} size="small" />
              <Link component="button" onClick={() => handleDownload(a.id, a.fileName)}>
                {a.fileName}
              </Link>
              <Typography variant="body2" color="text.secondary">
                {formatSize(a.sizeBytes)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                by {a.uploadedByName}
              </Typography>
            </ListItem>
          ))}
        </List>
      )}

      {downloadError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {downloadError}
        </Alert>
      )}

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        <TextField select size="small" value={type} onChange={(e) => setType(e.target.value as AttachmentType)} sx={{ minWidth: 140 }}>
          {TYPES.map((t) => (
            <MenuItem key={t} value={t}>
              {t}
            </MenuItem>
          ))}
        </TextField>
        <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={uploadAttachment.isPending}>
          {uploadAttachment.isPending ? "Uploading…" : "Upload File"}
          <input ref={fileInputRef} type="file" hidden onChange={handleFileChange} />
        </Button>
      </Box>
    </Box>
  );
}
