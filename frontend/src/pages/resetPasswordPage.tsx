import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import { useNavigate, useSearchParams } from "react-router-dom";
import { validateResetToken, resetPassword } from "../services/api";
import { validatePassword } from "../utils/formValidation";
import AuthForm from "../components/AuthForm";

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const [tokenValid, setTokenValid] = useState<boolean | null>(null); // null = checking
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) { setTokenValid(false); return; }
    validateResetToken(token)
      .then(() => setTokenValid(true))
      .catch(() => setTokenValid(false));
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const passwordError = validatePassword(newPassword);
    if (passwordError) { setError(passwordError); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }

    setLoading(true);
    try {
      await resetPassword(token, newPassword);
      navigate("/login", { state: { successMessage: "Password reset successfully. Please log in." }, replace: true });
    } catch {
      setError("Something went wrong. Please request a new reset link.");
    } finally {
      setLoading(false);
    }
  };

  // Checking token validity
  if (tokenValid === null) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", pt: 12 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Token invalid or already used
  if (tokenValid === false) {
    return (
      <AuthForm
        title="Link invalid"
        onSubmit={(e) => e.preventDefault()}
        loading={false}
        error={null}
        onErrorClose={() => {}}
        submitLabel=""
        footerText="Need a new link?"
        footerLinkLabel="Request password reset"
        footerLinkTo="/forgot-password"
      >
        <Alert severity="error" sx={{ mb: 3 }}>
          This password reset link is invalid or has already been used. Please request a new one.
        </Alert>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Reset password"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onErrorClose={() => setError(null)}
      submitLabel="Reset password"
      footerText="Remember your password?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <TextField
        margin="normal"
        required
        fullWidth
        name="newPassword"
        label="New password"
        type={showNew ? "text" : "password"}
        id="newPassword"
        autoComplete="new-password"
        autoFocus
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        disabled={loading}
        helperText="At least 8 characters, with uppercase, lowercase, digit, and special character"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowNew((v) => !v)} edge="end" tabIndex={-1}>
                {showNew ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm new password"
        type={showConfirm ? "text" : "password"}
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirm((v) => !v)} edge="end" tabIndex={-1}>
                {showConfirm ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
    </AuthForm>
  );
}
