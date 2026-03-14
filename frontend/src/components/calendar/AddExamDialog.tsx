import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { createExam } from "../../services/api";

interface Props {
  open: boolean;
  onClose: () => void;
}

interface FormErrors {
  title: string;
  examDate: string;
}

const NO_ERRORS: FormErrors = { title: "", examDate: "" };

export default function AddExamDialog({ open, onClose }: Props) {
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resetForm = () => {
    setTitle("");
    setExamDate("");
    setErrors(NO_ERRORS);
    setSaving(false);
    setSubmitError("");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const newErrors: FormErrors = {
      title: title.trim() ? "" : "Required",
      examDate: examDate ? "" : "Required",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSaving(true);
    setSubmitError("");

    try {
      await createExam({
        title: title.trim(),
        examDate,
      });

      window.dispatchEvent(new Event("examCreated"));
      resetForm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create exam";
      setSubmitError(message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Add Exam</DialogTitle>
      <DialogContent>
        <TextField
          label="Exam Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={!!errors.title}
          helperText={errors.title}
        />

        <TextField
          label="Exam Date"
          type="date"
          fullWidth
          margin="normal"
          value={examDate}
          onChange={(e) => {
            setExamDate(e.target.value);
            if (errors.examDate) setErrors((prev) => ({ ...prev, examDate: "" }));
          }}
          error={!!errors.examDate}
          helperText={errors.examDate}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={saving}>
          {saving ? "Adding..." : "Add Exam"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
