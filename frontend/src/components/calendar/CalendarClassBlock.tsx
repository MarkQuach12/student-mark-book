import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import type { ClassData } from "../../pages/classPage/types";
import { parseTime, formatMinutes } from "./calendarUtils";
import { useAuth } from "../../contexts/AuthContext";
import { getColorForClass } from "../../utils/classColors";

interface Props {
  classData: ClassData;
  startHour: number;
  pixelsPerHour: number;
}

function hexToRgba(hex: string, alpha: number): string {
  const m = hex.replace("#", "");
  const r = parseInt(m.slice(0, 2), 16);
  const g = parseInt(m.slice(2, 4), 16);
  const b = parseInt(m.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

const CalendarClassBlock = ({
  classData,
  startHour,
  pixelsPerHour,
}: Props) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const color = getColorForClass(user?.email ?? "", classData.id);

  const startMinutes = parseTime(classData.startTime);
  const endMinutes = parseTime(classData.endTime);
  const top = ((startMinutes - startHour * 60) / 60) * pixelsPerHour;
  const height = ((endMinutes - startMinutes) / 60) * pixelsPerHour;

  return (
    <Box
      onClick={() => navigate(`/classOverview/${classData.id}`)}
      sx={{
        position: "absolute",
        boxSizing: "border-box",
        top,
        height,
        left: 4,
        right: 4,
        backgroundColor: (t) =>
          t.palette.mode === "dark"
            ? hexToRgba(color.main, 0.18)
            : hexToRgba(color.main, 0.10),
        borderLeft: `3px solid ${color.main}`,
        borderTop: `1px solid ${hexToRgba(color.main, 0.25)}`,
        borderRight: `1px solid ${hexToRgba(color.main, 0.25)}`,
        borderBottom: `1px solid ${hexToRgba(color.main, 0.25)}`,
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
          backgroundColor: (t) =>
            t.palette.mode === "dark"
              ? hexToRgba(color.main, 0.28)
              : hexToRgba(color.main, 0.18),
        },
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 600, lineHeight: 1.25, fontSize: "0.75rem" }}
      >
        {classData.classLevel}
      </Typography>
      {classData.label && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ fontSize: "0.6875rem", lineHeight: 1.2 }}
        >
          {classData.label}
        </Typography>
      )}
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

export default CalendarClassBlock;
