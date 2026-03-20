import { useState, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { login, startDemo, startDemoAdmin } from "../services/api";
import { setToken } from "../utils/authStorage";
import { validateEmail } from "../utils/formValidation";
import { useAuth } from "../contexts/AuthContext";
import AuthForm from "../components/AuthForm";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [demoAdminLoading, setDemoAdminLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successMessage = (location.state as { successMessage?: string } | null)?.successMessage ?? null;

  useEffect(() => {
    if (successMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const emailError = validateEmail(email);
    if (emailError) { setError(emailError); return; }
    if (!password) { setError("Password is required."); return; }

    setLoading(true);
    try {
      const res = await login(email.trim(), password);
      setToken(res.token);
      setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      navigate("/", { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await startDemo();
      setToken(res.token);
      setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      navigate("/", { replace: true });
    } catch {
      setError("Unable to start demo. Please try again.");
    } finally {
      setDemoLoading(false);
    }
  };

  const handleDemoAdmin = async () => {
    setError(null);
    setDemoAdminLoading(true);
    try {
      const res = await startDemoAdmin();
      setToken(res.token);
      setUser({ id: res.id, name: res.name, email: res.email, role: res.role });
      navigate("/", { replace: true });
    } catch {
      setError("Unable to start admin demo. Please try again.");
    } finally {
      setDemoAdminLoading(false);
    }
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
      belowCard={
        <Box sx={{ mt: 2, textAlign: "center" }}>
          <Divider sx={{ mb: 2 }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemo}
            disabled={demoLoading || demoAdminLoading || loading}
          >
            {demoLoading ? <CircularProgress size={24} color="inherit" /> : "Try Demo (User)"}
          </Button>
          <Button
            fullWidth
            variant="outlined"
            onClick={handleDemoAdmin}
            disabled={demoLoading || demoAdminLoading || loading}
            sx={{ mt: 1 }}
          >
            {demoAdminLoading ? <CircularProgress size={24} color="inherit" /> : "Try Demo (Admin)"}
          </Button>
        </Box>
      }
    >
      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}
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
        type={showPassword ? "text" : "password"}
        id="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        disabled={loading}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((v) => !v)} edge="end" tabIndex={-1}>
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      <Typography variant="body2" sx={{ textAlign: "right", mt: 0.5 }}>
        <Link to="/forgot-password" style={{ color: "inherit" }}>
          Forgot password?
        </Link>
      </Typography>
    </AuthForm>
  );
}
