import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface AddHomeworkDialogProps {
  open: boolean;
  weekLabel: string;
  onClose: () => void;
  onAdd: (title: string) => void;
}

const AddHomeworkDialog = ({ open, weekLabel, onClose, onAdd }: AddHomeworkDialogProps) => {
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setTitle("");
    setError("");
    onClose();
  };

  const handleAdd = () => {
    const trimmed = title.trim();
    if (!trimmed) {
      setError("Title is required");
      return;
    }
    onAdd(trimmed);
    setTitle("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Homework – {weekLabel}</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Homework title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleAdd();
          }}
          error={!!error}
          helperText={error || ""}
        />
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleAdd} variant="contained">
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddHomeworkDialog;
