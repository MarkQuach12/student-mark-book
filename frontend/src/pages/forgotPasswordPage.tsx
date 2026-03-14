import { useState } from "react";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import { forgotPassword } from "../services/api";
import { validateEmail } from "../utils/formValidation";
import AuthForm from "../components/AuthForm";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }

    setLoading(true);
    try {
      await forgotPassword(email.trim());
      setSubmitted(true);
    } catch {
      // Still show success to avoid leaking whether email exists
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <AuthForm
        title="Check your email"
        onSubmit={(e) => e.preventDefault()}
        loading={false}
        error={null}
        onErrorClose={() => {}}
        submitLabel=""
        footerText="Remember your password?"
        footerLinkLabel="Log in"
        footerLinkTo="/login"
      >
        <Alert severity="success" sx={{ mb: 2 }}>
          If that email is registered, you'll receive a reset link shortly.
        </Alert>
      </AuthForm>
    );
  }

  return (
    <AuthForm
      title="Forgot password"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onErrorClose={() => setError(null)}
      submitLabel="Send reset link"
      footerText="Remember your password?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
        autoFocus
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={loading}
      />
    </AuthForm>
  );
}
