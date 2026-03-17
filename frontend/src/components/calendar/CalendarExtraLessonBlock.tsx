import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import type { ApiExtraLesson } from "../../services/api";
import { parseTime, formatMinutes } from "./calendarUtils";

interface Props {
  extraLesson: ApiExtraLesson;
  startHour: number;
  pixelsPerHour: number;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
}

const CalendarExtraLessonBlock = ({ extraLesson, startHour, pixelsPerHour, isAdmin, onDelete }: Props) => {
  const navigate = useNavigate();

  const startMinutes = parseTime(extraLesson.startTime);
  const endMinutes = parseTime(extraLesson.endTime);
  const top = ((startMinutes - startHour * 60) / 60) * pixelsPerHour;
  const height = ((endMinutes - startMinutes) / 60) * pixelsPerHour;

  return (
    <Box
      onClick={() => navigate(`/classOverview/${extraLesson.classId}`)}
      sx={{
        position: "absolute",
        boxSizing: "border-box",
        top,
        height,
        left: 4,
        right: 4,
        backgroundColor: "rgba(156, 39, 176, 0.15)",
        border: "2px dashed",
        borderColor: "#9C27B0",
        color: "#6A1B9A",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": { backgroundColor: "rgba(156, 39, 176, 0.25)", boxShadow: 2 },
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}
    >
      {isAdmin && onDelete && (
        <IconButton
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(extraLesson.id);
          }}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            p: 0.25,
            color: "#6A1B9A",
            "&:hover": { color: "#4A148C" },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: "0.8rem" }}
      >
        {extraLesson.title}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.85, fontSize: "0.65rem" }}>
        {extraLesson.classLevel}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.8, fontSize: "0.65rem" }}>
        {formatMinutes(startMinutes)}&ndash;{formatMinutes(endMinutes)}
      </Typography>
    </Box>
  );
};

export default CalendarExtraLessonBlock;
