import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

export type StatusKind =
  | "info"
  | "success"
  | "warning"
  | "error"
  | "neutral";

const kindToColor: Record<StatusKind, string> = {
  info: "info.main",
  success: "success.main",
  warning: "warning.main",
  error: "error.main",
  neutral: "text.disabled",
};

interface StatusDotProps {
  kind: StatusKind;
  label: string;
  size?: number;
}

export default function StatusDot({ kind, label, size = 8 }: StatusDotProps) {
  return (
    <Box sx={{ display: "inline-flex", alignItems: "center", gap: 1.5 }}>
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: "50%",
          bgcolor: kindToColor[kind],
          flexShrink: 0,
        }}
      />
      <Typography variant="body2" color="text.primary">
        {label}
      </Typography>
    </Box>
  );
}
