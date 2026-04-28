import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import AuthLayout from "./AuthLayout";

interface AuthFormProps {
  title: string;
  onSubmit: (e: React.FormEvent) => void;
  loading: boolean;
  error: string | null;
  onErrorClose: () => void;
  submitLabel: string;
  footerText: string;
  footerLinkLabel: string;
  footerLinkTo: string;
  children: ReactNode;
  belowCard?: ReactNode;
}

export default function AuthForm({
  title,
  onSubmit,
  loading,
  error,
  onErrorClose,
  submitLabel,
  footerText,
  footerLinkLabel,
  footerLinkTo,
  children,
  belowCard,
}: AuthFormProps) {
  return (
    <AuthLayout>
      <Typography component="h1" variant="h1" sx={{ mb: 6 }}>
        {title}
      </Typography>
      <Box component="form" onSubmit={onSubmit} noValidate>
        {error && (
          <Alert
            severity="error"
            variant="outlined"
            sx={{ mb: 4 }}
            onClose={onErrorClose}
          >
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {children}
        </Box>
        {submitLabel && (
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 6, py: 2 }}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              submitLabel
            )}
          </Button>
        )}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 4 }}
        >
          {footerText}{" "}
          <Link
            to={footerLinkTo}
            style={{ color: "inherit", fontWeight: 500, textDecoration: "underline" }}
          >
            {footerLinkLabel}
          </Link>
        </Typography>
      </Box>
      {belowCard}
    </AuthLayout>
  );
}
