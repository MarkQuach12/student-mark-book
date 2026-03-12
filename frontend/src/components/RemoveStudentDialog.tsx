import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Student } from "../pages/classPage/types";

interface RemoveStudentDialogProps {
  open: boolean;
  students: Student[];
  onClose: () => void;
  onRemove: (studentId: string) => void;
}

export default function RemoveStudentDialog({ open, students, onClose, onRemove }: RemoveStudentDialogProps) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmText, setConfirmText] = useState("");

  const confirmingStudent = students.find((s) => s.id === confirmingId);

  const handleClose = () => {
    setConfirmingId(null);
    setConfirmText("");
    onClose();
  };

  const handleConfirmRemove = () => {
    if (!confirmingId) return;
    onRemove(confirmingId);
    setConfirmingId(null);
    setConfirmText("");
  };

  return (
    <>
      <Dialog open={open && !confirmingId} onClose={handleClose} fullWidth maxWidth="xs">
        <DialogTitle>Remove Student</DialogTitle>
        <DialogContent>
          {students.length === 0 ? (
            <Typography color="text.secondary" sx={{ py: 2 }}>No students in this class.</Typography>
          ) : (
            <List disablePadding>
              {students.map((student) => (
                <ListItem key={student.id} disableGutters secondaryAction={
                  <IconButton edge="end" onClick={() => setConfirmingId(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                }>
                  <ListItemText primary={student.name} />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
      <Dialog
        open={open && confirmingId !== null}
        onClose={() => { setConfirmingId(null); setConfirmText(""); }}
      >
        <DialogTitle>Remove Student?</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            This will permanently remove <strong>{confirmingStudent?.name}</strong> and all their attendance, homework, and payment records.
          </Typography>
          <TextField
            fullWidth
            size="small"
            label={`Type "${confirmingStudent?.name}" to confirm`}
            value={confirmText}
            onChange={(e) => setConfirmText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => { setConfirmingId(null); setConfirmText(""); }}>Cancel</Button>
          <Button
            color="error"
            variant="contained"
            disabled={confirmText.toLowerCase() !== (confirmingStudent?.name ?? "").toLowerCase()}
            onClick={handleConfirmRemove}
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
