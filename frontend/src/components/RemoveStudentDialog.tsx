import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
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

  const handleClose = () => {
    setConfirmingId(null);
    onClose();
  };

  const handleConfirmRemove = (studentId: string) => {
    onRemove(studentId);
    setConfirmingId(null);
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>Remove Student</DialogTitle>
      <DialogContent>
        {students.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 2 }}>No students in this class.</Typography>
        ) : (
          <List disablePadding>
            {students.map((student) => (
              <ListItem key={student.id} disableGutters secondaryAction={
                confirmingId === student.id ? (
                  <Box sx={{ display: "flex", gap: 0.5 }}>
                    <Button size="small" color="error" variant="contained" onClick={() => handleConfirmRemove(student.id)}>
                      Remove
                    </Button>
                    <Button size="small" onClick={() => setConfirmingId(null)}>
                      Cancel
                    </Button>
                  </Box>
                ) : (
                  <IconButton edge="end" onClick={() => setConfirmingId(student.id)}>
                    <DeleteIcon />
                  </IconButton>
                )
              }>
                <ListItemText primary={student.name} />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>
    </Dialog>
  );
}
