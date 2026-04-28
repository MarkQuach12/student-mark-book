import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      <Box
        sx={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: { xs: 4, sm: 8 },
          py: 8,
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 400 }}>{children}</Box>
      </Box>
      <Box
        sx={{
          flex: 1,
          display: { xs: "none", md: "flex" },
          alignItems: "center",
          justifyContent: "center",
          bgcolor: (t) =>
            t.palette.mode === "dark" ? "#111114" : "#F9FAFB",
          borderLeft: 1,
          borderColor: "divider",
          px: 8,
        }}
      >
        <Box sx={{ maxWidth: 360 }}>
          <Typography
            variant="h2"
            sx={{ mb: 3, letterSpacing: "-0.02em" }}
          >
            MQ Student Mark Book
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage classes, students, attendance, homework, payments, and exams
            in one focused workspace.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
