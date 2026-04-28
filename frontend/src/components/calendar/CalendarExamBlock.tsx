import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ApiExam } from "../../services/api";

interface Props {
  exam: ApiExam;
}

const CalendarExamBlock = ({ exam }: Props) => {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1,
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(251, 191, 36, 0.10)"
            : "rgba(217, 119, 6, 0.08)",
        border: 1,
        borderColor: "warning.main",
        borderLeft: "3px solid",
        borderLeftColor: "warning.main",
        borderRadius: 1,
        px: 1.5,
        py: 0.5,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          bgcolor: "warning.main",
          flexShrink: 0,
        }}
      />
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="caption"
          sx={{
            fontWeight: 500,
            fontSize: "0.6875rem",
            lineHeight: 1.2,
            display: "block",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {exam.title}
        </Typography>
      </Box>
    </Box>
  );
};

export default CalendarExamBlock;
