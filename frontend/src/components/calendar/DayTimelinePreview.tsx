import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ApiClass } from "../../services/api";
import { parseTime, formatMinutes, formatTimeLabel } from "./calendarUtils";
import { validateTime, timeToMinutes } from "../../utils/formValidation";
import { getColorForClass } from "../../utils/classColors";
import { useAuth } from "../../contexts/AuthContext";

interface Props {
  existingClasses: ApiClass[];
  selectedDay: string;
  newStartTime: string;
  newEndTime: string;
  newClassLevel: string;
  newLabel: string;
}

const START_HOUR = 9;
const END_HOUR = 21;
const PIXELS_PER_HOUR = 40;
const TIME_LABEL_WIDTH = 32;
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * PIXELS_PER_HOUR;

export default function DayTimelinePreview({
  existingClasses,
  selectedDay,
  newStartTime,
  newEndTime,
  newClassLevel,
  newLabel,
}: Props) {
  const { user } = useAuth();
  const email = user?.email ?? "";

  if (!selectedDay) {
    return (
      <Box
        sx={{
          width: 150,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderLeft: "1px solid",
          borderColor: "divider",
          pl: 2,
        }}
      >
        <Typography variant="caption" color="text.secondary" textAlign="center">
          Select a day to see the timeline
        </Typography>
      </Box>
    );
  }

  const dayClasses = existingClasses.filter((c) => c.dayOfWeek === selectedDay);

  // Compute new class preview position
  const hasValidStart = !validateTime(newStartTime);
  const hasValidEnd = !validateTime(newEndTime);
  const newStartMin = hasValidStart ? timeToMinutes(newStartTime) : 0;
  const newEndMin = hasValidEnd ? timeToMinutes(newEndTime) : 0;
  const showPreview = hasValidStart && hasValidEnd && newEndMin > newStartMin;

  // Check overlap
  const hasOverlap =
    showPreview &&
    dayClasses.some(
      (cls) =>
        parseTime(cls.startTime) < newEndMin &&
        parseTime(cls.endTime) > newStartMin,
    );

  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i);

  return (
    <Box
      sx={{
        width: 170,
        flexShrink: 0,
        borderLeft: "1px solid",
        borderColor: "divider",
        pl: 2,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography variant="caption" fontWeight={600} sx={{ mb: 0.5 }}>
        {selectedDay}
      </Typography>
      <Box sx={{ position: "relative", height: TOTAL_HEIGHT, width: "100%" }}>
        {/* Hour gridlines */}
        {hours.map((hour) => {
          const top = (hour - START_HOUR) * PIXELS_PER_HOUR;
          return (
            <Box
              key={hour}
              sx={{
                position: "absolute",
                top,
                left: 0,
                right: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.55rem",
                  color: "text.secondary",
                  width: TIME_LABEL_WIDTH,
                  flexShrink: 0,
                  textAlign: "right",
                  pr: 0.5,
                  lineHeight: 1,
                  transform: "translateY(-50%)",
                }}
              >
                {formatTimeLabel(hour)}
              </Typography>
              <Box
                sx={{
                  flex: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                }}
              />
            </Box>
          );
        })}

        {/* Existing class blocks */}
        {dayClasses.map((cls) => {
          const startMin = parseTime(cls.startTime);
          const endMin = parseTime(cls.endTime);
          const top = ((startMin - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
          const height = ((endMin - startMin) / 60) * PIXELS_PER_HOUR;
          const color = getColorForClass(email, cls.id);

          return (
            <Box
              key={cls.id}
              sx={{
                position: "absolute",
                top,
                height,
                left: TIME_LABEL_WIDTH + 4,
                right: 0,
                backgroundColor: color.main,
                color: "#fff",
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25,
                overflow: "hidden",
              }}
            >
              <Typography sx={{ fontSize: "0.6rem", fontWeight: 700, lineHeight: 1.2 }}>
                {cls.classLevel}
              </Typography>
              <Typography sx={{ fontSize: "0.55rem", opacity: 0.9, lineHeight: 1.1 }}>
                {formatMinutes(startMin)}&ndash;{formatMinutes(endMin)}
              </Typography>
            </Box>
          );
        })}

        {/* New class preview */}
        {showPreview && (() => {
          const top = ((newStartMin - START_HOUR * 60) / 60) * PIXELS_PER_HOUR;
          const height = ((newEndMin - newStartMin) / 60) * PIXELS_PER_HOUR;
          return (
            <Box
              sx={{
                position: "absolute",
                top,
                height,
                left: TIME_LABEL_WIDTH + 4,
                right: 0,
                backgroundColor: hasOverlap
                  ? "rgba(211, 47, 47, 0.15)"
                  : "rgba(21, 101, 192, 0.15)",
                border: "2px dashed",
                borderColor: hasOverlap ? "#D32F2F" : "#1565C0",
                borderRadius: 0.5,
                px: 0.5,
                py: 0.25,
                overflow: "hidden",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.6rem",
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: hasOverlap ? "#D32F2F" : "#1565C0",
                }}
              >
                {newClassLevel || "New Class"}
              </Typography>
              {newLabel && (
                <Typography
                  sx={{
                    fontSize: "0.5rem",
                    lineHeight: 1.1,
                    color: hasOverlap ? "#D32F2F" : "#1565C0",
                    opacity: 0.8,
                  }}
                >
                  {newLabel}
                </Typography>
              )}
              <Typography
                sx={{
                  fontSize: "0.55rem",
                  lineHeight: 1.1,
                  color: hasOverlap ? "#D32F2F" : "#1565C0",
                  opacity: 0.9,
                }}
              >
                {formatMinutes(newStartMin)}&ndash;{formatMinutes(newEndMin)}
              </Typography>
            </Box>
          );
        })()}
      </Box>
    </Box>
  );
}
