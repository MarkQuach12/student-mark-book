import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import { useNavigate } from "react-router-dom";
import type { ApiExtraLesson } from "../../services/api";
import { parseTime, formatMinutes } from "./calendarUtils";
import { useAuth } from "../../contexts/AuthContext";
import { getColorForClass } from "../../utils/classColors";

interface Props {
  extraLesson: ApiExtraLesson;
  startHour: number;
  pixelsPerHour: number;
  isAdmin: boolean;
  onDelete?: (id: string) => void;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CalendarExtraLessonBlock = ({
  extraLesson,
  startHour,
  pixelsPerHour,
  isAdmin,
  onDelete,
}: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const color = getColorForClass(user?.email ?? "", extraLesson.classId);

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
        bgcolor: (t) =>
          t.palette.mode === "dark"
            ? hexToRgba(color.main, 0.10)
            : hexToRgba(color.main, 0.06),
        border: `1px dashed ${color.main}`,
        borderLeft: `3px dashed ${color.main}`,
        color: "text.primary",
        borderRadius: 1,
        px: 1.5,
        py: 0.75,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        transition: "background-color 150ms",
        "&:hover": {
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? hexToRgba(color.main, 0.18)
              : hexToRgba(color.main, 0.12),
        },
      }}
    >
      {isAdmin && onDelete && (
        <Tooltip title="Delete extra lesson">
          <IconButton
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(extraLesson.id);
            }}
            sx={{
              position: "absolute",
              top: 2,
              right: 2,
              p: 0.25,
              color: "text.secondary",
              "&:hover": { color: "text.primary" },
            }}
          >
            <CloseIcon sx={{ fontSize: 12 }} />
          </IconButton>
        </Tooltip>
      )}
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, lineHeight: 1.25, fontSize: "0.75rem", pr: 3 }}
      >
        {extraLesson.title}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: "0.6875rem" }}
      >
        {extraLesson.classLevel}
      </Typography>
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          fontSize: "0.6875rem",
          fontFamily: "'JetBrains Mono', monospace",
        }}
      >
        {formatMinutes(startMinutes)}–{formatMinutes(endMinutes)}
      </Typography>
    </Box>
  );
};

export default CalendarExtraLessonBlock;
