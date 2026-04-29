import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { createExtraLesson } from "../../services/api";
import type { ApiClass } from "../../services/api";
import { validateTime, timeToMinutes } from "../../utils/formValidation";

const TIME_OPTIONS: string[] = [];
for (let h = 9; h <= 21; h++) {
  for (const m of [0, 15, 30, 45]) {
    const hour = h.toString().padStart(2, "0");
    const minute = m.toString().padStart(2, "0");
    TIME_OPTIONS.push(`${hour}:${minute}`);
  }
}

interface Props {
  open: boolean;
  classes: ApiClass[];
  onClose: () => void;
  onCreated: () => void;
}

interface FormErrors {
  classId: string;
  title: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
}

const NO_ERRORS: FormErrors = { classId: "", title: "", lessonDate: "", startTime: "", endTime: "" };

export default function AddExtraLessonDialog({ open, classes, onClose, onCreated }: Props) {
  const [classId, setClassId] = useState("");
  const [title, setTitle] = useState("");
  const [lessonDate, setLessonDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const resetForm = () => {
    setClassId("");
    setTitle("");
    setLessonDate("");
    setStartTime("");
    setEndTime("");
    setErrors(NO_ERRORS);
    setSaving(false);
    setSubmitError("");
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleCreate = async () => {
    const today = new Date().toISOString().split("T")[0];
    const newErrors: FormErrors = {
      classId: classId ? "" : "Required",
      title: title.trim() ? "" : "Required",
      lessonDate: lessonDate
        ? lessonDate < today
          ? "Date cannot be in the past"
          : ""
        : "Required",
      startTime: validateTime(startTime),
      endTime: validateTime(endTime),
    };

    if (!newErrors.startTime && !newErrors.endTime) {
      if (timeToMinutes(endTime) <= timeToMinutes(startTime)) {
        newErrors.endTime = "End time must be after start time";
      }
    }

    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    setSaving(true);
    setSubmitError("");

    try {
      await createExtraLesson({
        classId,
        title: title.trim(),
        lessonDate,
        startTime,
        endTime,
      });

      window.dispatchEvent(new Event("extraLessonCreated"));
      onCreated();
      resetForm();
      onClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create extra lesson";
      setSubmitError(message);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Add Extra Lesson</DialogTitle>
      <DialogContent>
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
              {cls.classLevel} - {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="Title"
          fullWidth
          margin="normal"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: "" }));
          }}
          error={!!errors.title}
          helperText={errors.title}
          placeholder="e.g. Mock Exam Practice"
          inputProps={{ maxLength: 200 }}
        />

        <TextField
          label="Lesson Date"
          type="date"
          fullWidth
          margin="normal"
          value={lessonDate}
          onChange={(e) => {
            setLessonDate(e.target.value);
            if (errors.lessonDate) setErrors((prev) => ({ ...prev, lessonDate: "" }));
          }}
          error={!!errors.lessonDate}
          helperText={errors.lessonDate}
          slotProps={{ inputLabel: { shrink: true } }}
          inputProps={{ min: new Date().toISOString().split("T")[0] }}
        />

        <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
          <Autocomplete
            freeSolo
            fullWidth
            options={TIME_OPTIONS}
            value={startTime}
            onChange={(_e, value) => {
              setStartTime(value ?? "");
              if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: "" }));
            }}
            onInputChange={(_e, value) => {
              setStartTime(value);
              if (errors.startTime) setErrors((prev) => ({ ...prev, startTime: "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Start Time"
                placeholder="HH:MM"
                margin="normal"
                error={!!errors.startTime}
                helperText={errors.startTime || ""}
              />
            )}
          />
          <Autocomplete
            freeSolo
            fullWidth
            options={TIME_OPTIONS}
            value={endTime}
            onChange={(_e, value) => {
              setEndTime(value ?? "");
              if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: "" }));
            }}
            onInputChange={(_e, value) => {
              setEndTime(value);
              if (errors.endTime) setErrors((prev) => ({ ...prev, endTime: "" }));
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="End Time"
                placeholder="HH:MM"
                margin="normal"
                error={!!errors.endTime}
                helperText={errors.endTime || ""}
              />
            )}
          />
        </Box>

        {submitError && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {submitError}
          </Alert>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={saving}>
          {saving ? "Adding..." : "Add Extra Lesson"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
