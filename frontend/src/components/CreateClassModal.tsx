import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import FormHelperText from "@mui/material/FormHelperText";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import { createClass, addStudent } from "../services/api";
import { validateTime, timeToMinutes } from "../utils/formValidation";
import type { ClassData } from "../pages/classPage/types";

const CLASS_LEVELS = [
  "Y11 Standard",
  "Y11 Advanced",
  "Y11 Extension 1",
  "Y12 Standard",
  "Y12 Advanced",
  "Y12 Extension 1",
  "Y12 Extension 2",
] as const;

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

const TIME_OPTIONS: string[] = [];
for (let h = 9; h <= 21; h++) {
  for (const m of [0, 15, 30, 45]) {
    const hour = h.toString().padStart(2, "0");
    const minute = m.toString().padStart(2, "0");
    TIME_OPTIONS.push(`${hour}:${minute}`);
  }
}

interface CreateClassModalProps {
  open: boolean;
  onClose: () => void;
  onClassCreated: (newClass: ClassData) => void;
}

interface FormErrors {
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
}

const NO_ERRORS: FormErrors = { classLevel: "", dayOfWeek: "", startTime: "", endTime: "" };

export default function CreateClassModal({ open, onClose, onClassCreated }: CreateClassModalProps) {
  const [classLevel, setClassLevel] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [studentNames, setStudentNames] = useState<string[]>([""]);
  const [errors, setErrors] = useState<FormErrors>(NO_ERRORS);
  const [saving, setSaving] = useState(false);

  const resetForm = () => {
    setClassLevel("");
    setDayOfWeek("");
    setStartTime("");
    setEndTime("");
    setStudentNames([""]);
    setErrors(NO_ERRORS);
    setSaving(false);
  };

  const handleCancel = () => {
    resetForm();
    onClose();
  };

  const handleAddStudent = () => {
    setStudentNames((prev) => [...prev, ""]);
  };

  const handleStudentNameChange = (index: number, value: string) => {
    setStudentNames((prev) => {
      const updated = [...prev];
      updated[index] = value;
      return updated;
    });
  };

  const handleRemoveStudent = (index: number) => {
    setStudentNames((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreate = async () => {
    const newErrors: FormErrors = {
      classLevel: classLevel ? "" : "Required",
      dayOfWeek: dayOfWeek ? "" : "Required",
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

    try {
      const trimmedStart = startTime.trim();
      const trimmedEnd = endTime.trim();

      const newClass = await createClass({
        classLevel,
        dayOfWeek,
        startTime: trimmedStart,
        endTime: trimmedEnd,
      });

      // Add students in parallel
      const validNames = studentNames.map((n) => n.trim()).filter((n) => n.length > 0);
      if (validNames.length > 0) {
        await Promise.all(validNames.map((name) => addStudent(newClass.id, name)));
      }

      onClassCreated(newClass);
      resetForm();
      onClose();
    } catch (err) {
      console.error("Failed to create class:", err);
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} fullWidth maxWidth="sm">
      <DialogTitle>Create New Class</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="normal" error={!!errors.classLevel}>
          <InputLabel id="class-level-label">Class Level</InputLabel>
          <Select
            labelId="class-level-label"
            value={classLevel}
            label="Class Level"
            onChange={(e) => {
              setClassLevel(e.target.value);
              if (errors.classLevel) setErrors((prev) => ({ ...prev, classLevel: "" }));
            }}
          >
            {CLASS_LEVELS.map((level) => (
              <MenuItem key={level} value={level}>
                {level}
              </MenuItem>
            ))}
          </Select>
          {errors.classLevel && <FormHelperText>{errors.classLevel}</FormHelperText>}
        </FormControl>

        <FormControl fullWidth margin="normal" error={!!errors.dayOfWeek}>
          <InputLabel id="day-of-week-label">Day of the Week</InputLabel>
          <Select
            labelId="day-of-week-label"
            value={dayOfWeek}
            label="Day of the Week"
            onChange={(e) => {
              setDayOfWeek(e.target.value);
              if (errors.dayOfWeek) setErrors((prev) => ({ ...prev, dayOfWeek: "" }));
            }}
          >
            {DAYS_OF_WEEK.map((day) => (
              <MenuItem key={day} value={day}>
                {day}
              </MenuItem>
            ))}
          </Select>
          {errors.dayOfWeek && <FormHelperText>{errors.dayOfWeek}</FormHelperText>}
        </FormControl>

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

        <Box sx={{ mt: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Students
            </Typography>
            <IconButton
              size="small"
              color="primary"
              onClick={handleAddStudent}
              sx={{ ml: 1 }}
              aria-label="Add student"
            >
              <AddIcon />
            </IconButton>
          </Box>

          {studentNames.map((name, index) => (
            <Box key={index} sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <TextField
                label={`Student ${index + 1}`}
                fullWidth
                size="small"
                value={name}
                onChange={(e) => handleStudentNameChange(index, e.target.value)}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => handleRemoveStudent(index)}
                disabled={studentNames.length === 1}
                sx={{ ml: 0.5 }}
                aria-label={`Remove student ${index + 1}`}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={handleCancel} disabled={saving}>Cancel</Button>
        <Button onClick={handleCreate} variant="contained" disabled={saving}>
          {saving ? "Creating…" : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
