import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import type { ClassData } from "../../pages/classPage/types";
import { parseTime, formatMinutes } from "./calendarUtils";

interface Props {
  classData: ClassData;
  startHour: number;
  pixelsPerHour: number;
}

const CalendarClassBlock = ({ classData, startHour, pixelsPerHour }: Props) => {
  const navigate = useNavigate();

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
        backgroundColor: "#00796B",
        color: "#fff",
        borderRadius: 1,
        px: 1,
        py: 0.5,
        cursor: "pointer",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        "&:hover": { backgroundColor: "#00695C", boxShadow: 2 },
        transition: "background-color 0.2s, box-shadow 0.2s",
      }}
    >
      <Typography
        variant="body2"
        sx={{ fontWeight: 700, lineHeight: 1.3, fontSize: "0.8rem" }}
      >
        {classData.classLevel}
      </Typography>
      <Typography variant="caption" sx={{ opacity: 0.9, fontSize: "0.7rem" }}>
        {formatMinutes(startMinutes)}–{formatMinutes(endMinutes)}
      </Typography>
    </Box>
  );
};

export default CalendarClassBlock;
