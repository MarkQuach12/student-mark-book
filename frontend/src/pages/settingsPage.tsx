import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import { useAuth } from "../contexts/AuthContext";
import { getInitials } from "../utils/stringUtils";
import { validatePassword } from "../utils/formValidation";
import { updateUserName, changePassword, fetchClasses } from "../services/api";
import type { ClassData } from "./classPage/types";
import {
  CLASS_COLOR_PALETTE,
  getClassColorMap,
  setClassColor,
} from "../utils/classColors";

function SectionTitle({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h4" sx={{ mb: description ? 1 : 0 }}>
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      )}
    </Box>
  );
}

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, setUser } = useAuth();

  const [name, setName] = useState("");
  const [nameSaving, setNameSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [toast, setToast] = useState<
    { type: "success" | "error"; message: string } | null
  >(null);

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
      setToast({
        type: "error",
        message: "Failed to update name. Please try again.",
      });
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
    const passwordError = validatePassword(newPassword);
    if (passwordError) {
      setToast({ type: "error", message: passwordError });
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
      setToast({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update password.",
      });
    }
  };

  return (
    <Container maxWidth="md" sx={{ pt: 6, pb: 8 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
        Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 8 }}>
        Manage your account and class preferences.
      </Typography>

      <Card sx={{ p: 5, mb: 4 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 5 }}>
          <Avatar
            sx={{
              width: 56,
              height: 56,
              fontSize: 22,
              bgcolor: "primary.main",
              color: "primary.contrastText",
            }}
          >
            {getInitials(user.name)}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              {user.name}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "'JetBrains Mono', monospace" }}
            >
              {user.email}
            </Typography>
          </Box>
        </Box>

        <Divider sx={{ mb: 5 }} />

        <SectionTitle title="Full name" />
        <Box sx={{ display: "flex", gap: 2, mb: 6 }}>
          <TextField
            size="small"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
            inputProps={{ maxLength: 100 }}
          />
          <Button
            variant="contained"
            onClick={handleSaveName}
            disabled={nameSaving}
          >
            Save
          </Button>
        </Box>

        <Divider sx={{ mb: 5 }} />

        <SectionTitle title="Change password" />
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            size="small"
            type="password"
            label="Current password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
          />
          <TextField
            size="small"
            type="password"
            label="New password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            helperText="At least 8 characters, with uppercase, lowercase, digit, and special character (@$!%*?&)"
          />
          <TextField
            size="small"
            type="password"
            label="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={handleUpdatePassword}
            sx={{ alignSelf: "flex-start" }}
          >
            Update password
          </Button>
        </Box>
      </Card>

      {classes.length > 0 && (
        <Card sx={{ p: 5, mb: 4 }}>
          <SectionTitle
            title="Calendar colors"
            description="Choose a color for each class in the calendar view."
          />
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {classes.map((cls) => (
              <Box
                key={cls.id}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 3,
                  flexWrap: "wrap",
                }}
              >
                <Typography
                  variant="body2"
                  sx={{ minWidth: 200, fontWeight: 500 }}
                >
                  {cls.classLevel}{" "}
                  <Box
                    component="span"
                    sx={{
                      color: "text.secondary",
                      fontFamily: "'JetBrains Mono', monospace",
                      fontWeight: 400,
                    }}
                  >
                    · {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
                  </Box>
                </Typography>
                <Box sx={{ display: "flex", gap: 1.5 }}>
                  {CLASS_COLOR_PALETTE.map((opt) => {
                    const selected = (colorMap[cls.id] ?? "teal") === opt.key;
                    return (
                      <Box
                        key={opt.key}
                        onClick={() => handleColorChange(cls.id, opt.key)}
                        sx={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          backgroundColor: opt.main,
                          cursor: "pointer",
                          outline: selected
                            ? "2px solid"
                            : "2px solid transparent",
                          outlineColor: selected ? "text.primary" : undefined,
                          outlineOffset: 2,
                          transition: "outline-color 150ms",
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            ))}
          </Box>
        </Card>
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.type ?? "success"}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast?.message ?? ""}
        </Alert>
      </Snackbar>
    </Container>
  );
}
