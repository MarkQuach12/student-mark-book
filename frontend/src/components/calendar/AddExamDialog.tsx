import { useState } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { createExam } from "../../services/api";
import type { ApiClass } from "../../services/api";

interface Props {
  open: boolean;
  onClose: () => void;
  classes: ApiClass[];
  preselectedClassId?: string;
}

interface FormErrors {
  classId: string;
  title: string;
  examDate: string;
}

const NO_ERRORS: FormErrors = { classId: "", title: "", examDate: "" };

export default function AddExamDialog({ open, onClose, classes, preselectedClassId }: Props) {
  const [classId, setClassId] = useState(preselectedClassId ?? "");
  const [title, setTitle] = useState("");
  const [examDate, setExamDate] = useState("");
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resetForm = () => {
    setClassId(preselectedClassId ?? "");
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
      classId: classId ? "" : "Required",
      title: title.trim() ? "" : "Required",
      examDate: examDate ? "" : "Required",
    };

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSaving(true);
    setSubmitError("");

    try {
      await createExam({
        classId,
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
        {!preselectedClassId && (
          <TextField
            select
            label="Class"
            fullWidth
            margin="normal"
            value={classId}
            onChange={(e) => {
              setClassId(e.target.value);
              if (errors.classId) setErrors((prev) => ({ ...prev, classId: "" }));
            }}
            error={!!errors.classId}
            helperText={errors.classId}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.id} value={cls.id}>
                {cls.classLevel} — {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
              </MenuItem>
            ))}
          </TextField>
        )}

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
