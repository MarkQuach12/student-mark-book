import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import { useSimpleDialog } from "../hooks/useSimpleDialog";

interface AddStudentDialogProps {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
}

export default function AddStudentDialog({ open, onClose, onAdd }: AddStudentDialogProps) {
  const { value, error, handleChange, handleClose, handleAdd } = useSimpleDialog(
    onAdd,
    onClose,
    "Name is required"
  );

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Add Student</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          label="Student name"
          fullWidth
          margin="normal"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleAdd(); }}
          error={!!error}
          helperText={error || ""}
          inputProps={{ maxLength: 100 }}
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
}
