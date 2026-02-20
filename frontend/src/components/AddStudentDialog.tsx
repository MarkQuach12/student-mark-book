import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

const AddStudentDialog = ({ open, onClose, onAdd }: AddStudentDialogProps) => {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleClose = () => {
    setName("");
    setError("");
    onClose();
  };

  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name is required");
      return;
    }
    onAdd(trimmed);
    setName("");
    setError("");
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Student</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Student name"
          fullWidth
          margin="normal"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
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

export default AddStudentDialog;
