import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getInitials } from "../utils/stringUtils";
import { updateUserName, changePassword, fetchClasses } from "../services/api";
import type { ClassData } from "./classPage/types";
import {
  CLASS_COLOR_PALETTE,
  getClassColorMap,
  setClassColor,
} from "../utils/classColors";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [classes, setClasses] = useState<ClassData[]>([]);
  const [colorMap, setColorMap] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) {
      navigate("/login", { replace: true });
      return;
    }
    setName(user.name);
    fetchClasses().then(setClasses).catch(() => {});
    setColorMap(getClassColorMap(user.id));
  }, [user, navigate]);

  if (!user) return null;

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setToast({ type: "error", message: "Name cannot be empty." });
      return;
    }
    if (trimmed === user.name) {
      return;
    }
    setNameSaving(true);
    try {
      await updateUserName(trimmed);
      setUser({ ...user, name: trimmed });
      setToast({ type: "success", message: "Name updated successfully." });
    } catch {
      setToast({ type: "error", message: "Failed to update name. Please try again." });
    } finally {
      setNameSaving(false);
    }
  };

  const handleColorChange = (classId: string, colorKey: string) => {
    if (!user) return;
    setClassColor(user.id, classId, colorKey);
    setColorMap((prev) => ({ ...prev, [classId]: colorKey }));
    setToast({ type: "success", message: "Color updated." });
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 8) {
      setToast({ type: "error", message: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", message: "New passwords do not match." });
      return;
    }
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ type: "success", message: "Password updated successfully." });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to update password." });
    }
  };

  return (
    <Container maxWidth="sm" sx={{ pt: 12, pb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Settings
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
          <Avatar sx={{ width: 64, height: 64, fontSize: 28, bgcolor: "primary.main" }}>
            {getInitials(user.name)}
          </Avatar>
          <Box>
            <Typography variant="h6">{user.name}</Typography>
            <Typography variant="body2" color="text.secondary">{user.email}</Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          Full Name
        </Typography>
        <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />
          <Button variant="contained" onClick={handleSaveName} disabled={nameSaving}>
            Save
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          Email
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {user.email}
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="subtitle1" gutterBottom fontWeight={600}>
          Change Password
        </Typography>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
          <TextField
            size="small"
            type="password"
            label="Current Password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            size="small"
            type="password"
            label="New Password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <TextField
            size="small"
            type="password"
            label="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button variant="contained" onClick={handleUpdatePassword} sx={{ alignSelf: "flex-start" }}>
            Update Password
          </Button>
        </Box>
      </Paper>

      {classes.length > 0 && (
        <Paper sx={{ p: 3, mb: 3 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight={600}>
            Calendar Colors
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Choose a color for each class in the calendar view.
          </Typography>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {classes.map((cls) => (
              <Box key={cls.id} sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                <Typography variant="body2" sx={{ minWidth: 180, fontWeight: 500 }}>
                  {cls.classLevel} — {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
                </Typography>
                <Box sx={{ display: "flex", gap: 1 }}>
                  {CLASS_COLOR_PALETTE.map((opt) => (
                    <Box
                      key={opt.key}
                      onClick={() => handleColorChange(cls.id, opt.key)}
                      sx={{
                        width: 28,
                        height: 28,
                        borderRadius: "50%",
                        backgroundColor: opt.main,
                        cursor: "pointer",
                        border: "3px solid",
                        borderColor:
                          (colorMap[cls.id] ?? "teal") === opt.key
                            ? "text.primary"
                            : "transparent",
                        transition: "border-color 0.15s, transform 0.15s",
                        "&:hover": { transform: "scale(1.15)" },
                      }}
                    />
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Paper>
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert onClose={() => setToast(null)} severity={toast?.type ?? "success"} variant="filled" sx={{ width: "100%" }}>
          {toast?.message ?? "f"}
        </Alert>
      </Snackbar>
    </Container>
  );
}
