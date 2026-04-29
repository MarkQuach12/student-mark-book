import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import type { ApiTopic } from "../../services/api";
import { createTopic } from "../../services/api";

interface AddTopicDialogProps {
  open: boolean;
  classLevel: string;
  onClose: () => void;
  onCreated: (topic: ApiTopic) => void;
}

export default function AddTopicDialog({ open, classLevel, onClose, onCreated }: AddTopicDialogProps) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleClose = () => {
    setName("");
    setError(null);
    onClose();
  };

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const topic = await createTopic(classLevel, name.trim());
      onCreated(topic);
      setName("");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create topic.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Add Topic</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          label="Topic Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          sx={{ mt: 1 }}
          disabled={saving}
          inputProps={{ maxLength: 100 }}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button variant="contained" disabled={!name.trim() || saving} onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
