import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { findUserByEmail } from "../utils/authStorage";
import { validateEmail } from "../utils/formValidation";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    setTimeout(() => {
      const user = findUserByEmail(email.trim());
      if (!user || user.password !== password) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }
      setUser({ name: user.name, email: user.email });
      setLoading(false);
      navigate("/", { replace: true });
    }, 300);
  };

  return (
    <AuthForm
      title="Log in"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onErrorClose={() => setError(null)}
      submitLabel="Log in"
      footerText="Don't have an account?"
      footerLinkLabel="Sign up"
      footerLinkTo="/signup"
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
      <TextField
        margin="normal"
        required
        fullWidth
        name="password"
        label="Password"
        type="password"
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
      />
    </AuthForm>
  );
}
