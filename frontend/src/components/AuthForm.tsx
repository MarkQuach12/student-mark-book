import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";

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
}: AuthFormProps) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        pt: 8,
        pb: 2,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
      }}
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Box component="form" onSubmit={onSubmit} noValidate>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }} onClose={onErrorClose}>
                {error}
              </Alert>
            )}
            {children}
            {submitLabel && (
              <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : submitLabel}
              </Button>
            )}
            <Typography variant="body2" sx={{ textAlign: "center" }}>
              {footerText}{" "}
              <Link to={footerLinkTo} style={{ color: "inherit", fontWeight: 600 }}>
                {footerLinkLabel}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
