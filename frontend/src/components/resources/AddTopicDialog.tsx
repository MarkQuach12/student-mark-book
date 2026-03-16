import { useState } from "react";
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

  const handleSubmit = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      const topic = await createTopic(classLevel, name.trim());
      onCreated(topic);
      setName("");
      onClose();
    } catch {
      // Could show error
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
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
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" disabled={!name.trim() || saving} onClick={handleSubmit}>
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
}
