import { useState } from "react";
import TextField from "@mui/material/TextField";
import { useNavigate } from "react-router-dom";
import { addUser, findUserByEmail } from "../utils/authStorage";
import { validateEmail } from "../utils/formValidation";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";

export default function SignUpPage() {
  const navigate = useNavigate();
  const { setUser } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) { setError("Name is required."); return; }
    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    if (!password) { setError("Password is required."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }

    if (findUserByEmail(email.trim())) {
      setError("An account with this email already exists.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      addUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      });
      setUser({ name: name.trim(), email: email.trim().toLowerCase() });
      setLoading(false);
      navigate("/", { replace: true });
    }, 300);
  };

  return (
    <AuthForm
      title="Sign up"
      onSubmit={handleSubmit}
      loading={loading}
      error={error}
      onErrorClose={() => setError(null)}
      submitLabel="Sign up"
      footerText="Already have an account?"
      footerLinkLabel="Log in"
      footerLinkTo="/login"
    >
      <TextField
        margin="normal"
        required
        fullWidth
        id="name"
        label="Name"
        name="name"
        autoComplete="name"
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        disabled={loading}
      />
      <TextField
        margin="normal"
        required
        fullWidth
        id="email"
        label="Email"
        name="email"
        type="email"
        autoComplete="email"
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
        autoComplete="new-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        helperText="At least 8 characters"
      />
      <TextField
        margin="normal"
        required
        fullWidth
        name="confirmPassword"
        label="Confirm password"
        type="password"
        id="confirmPassword"
        autoComplete="new-password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        disabled={loading}
      />
    </AuthForm>
  );
}
