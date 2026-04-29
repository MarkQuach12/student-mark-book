import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import type { ApiResource } from "../../services/api";
import { createResource } from "../../services/api";

interface AddResourceDialogProps {
  open: boolean;
  topicId: string | null;
  onClose: () => void;
  onAdded: (resources: ApiResource[]) => void;
}

function isValidUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function AddResourceDialog({ open, topicId, onClose, onAdded }: AddResourceDialogProps) {
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlError, setUrlError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!topicId || !title.trim() || !url.trim()) return;
    if (!isValidUrl(url.trim())) {
      setUrlError("Enter a valid URL starting with http:// or https://");
      return;
    }
    setSaving(true);
    setError(null);
    setUrlError(null);
    try {
      const resource = await createResource(topicId, { title: title.trim(), driveUrl: url.trim() });
      onAdded([resource]);
      setTitle("");
      setUrl("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add resource");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Resource</DialogTitle>
      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
          <TextField
            autoFocus
            fullWidth
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={saving}
            inputProps={{ maxLength: 200 }}
          />
          <TextField
            fullWidth
            label="URL"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (urlError) setUrlError(null);
            }}
            disabled={saving}
            placeholder="https://drive.google.com/..."
            inputProps={{ maxLength: 2000 }}
            error={!!urlError}
            helperText={urlError ?? ""}
          />
          {error && <Alert severity="error">{error}</Alert>}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!title.trim() || !url.trim() || saving}
          onClick={handleSubmit}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
