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
        backgroundColor: "warning.dark",
        color: "warning.contrastText",
        borderRadius: 1,
        borderLeft: "3px dashed",
        borderLeftColor: "rgba(255,255,255,0.5)",
        px: 1,
        py: 0.5,
        overflow: "hidden",
        "&:hover": { filter: "brightness(0.85)", boxShadow: 2 },
        transition: "background-color 0.2s, box-shadow 0.2s",
        cursor: "default",
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: "0.8rem" }}>
        {exam.title}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.7rem" }}>
        All day
      </Typography>
    </Box>
  );
};

export default CalendarExamBlock;
