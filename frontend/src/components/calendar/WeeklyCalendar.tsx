import { useMemo } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ClassData } from "../../pages/classPage/types";
import { DAY_COLUMNS, parseTime, formatTimeLabel } from "./calendarUtils";
import CalendarClassBlock from "./CalendarClassBlock";

interface Props {
  classes: ClassData[];
}

const PIXELS_PER_HOUR = 70;
const TIME_COL_WIDTH = 48;
const DAY_COL_MIN_WIDTH = 130;
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 20;

const WeeklyCalendar = ({ classes }: Props) => {
  const { startHour, endHour, classesByDay } = useMemo(() => {
    let minHour = DEFAULT_START_HOUR;
    let maxHour = DEFAULT_END_HOUR;

    const byDay: Record<string, ClassData[]> = {};
    for (const day of DAY_COLUMNS) byDay[day] = [];

    for (const cls of classes) {
      const startMin = parseTime(cls.startTime);
      const endMin = parseTime(cls.endTime);
      const sHour = Math.floor(startMin / 60);
      const eHour = Math.ceil(endMin / 60);
      if (sHour < minHour) minHour = sHour;
      if (eHour > maxHour) maxHour = eHour;
      if (byDay[cls.dayOfWeek]) {
        byDay[cls.dayOfWeek].push(cls);
      }
    }

    return { startHour: minHour, endHour: maxHour, classesByDay: byDay };
  }, [classes]);

  const totalHours = endHour - startHour;
  const gridHeight = totalHours * PIXELS_PER_HOUR;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        {/* Day headers */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
            borderColor: "divider",
          }}
        >
          <Box />
          {DAY_COLUMNS.map((day, idx) => (
            <Box
              key={day}
              sx={{
                py: 1,
                textAlign: "center",
                borderTop: "1px solid",
                borderLeft: "1px solid",
                borderRight: idx === DAY_COLUMNS.length - 1 ? "1px solid" : undefined,
                borderColor: "divider",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {day}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* Time grid */}
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
            position: "relative",
          }}
        >
          {/* Time labels column */}
          <Box sx={{ position: "relative", height: gridHeight }}>
            {hours.map((hour) => (
              <Typography
                key={hour}
                variant="caption"
                sx={{
                  position: "absolute",
                  top: (hour - startHour) * PIXELS_PER_HOUR - 8,
                  right: 8,
                  color: "text.secondary",
                  fontSize: "0.75rem",
                  whiteSpace: "nowrap",
                }}
              >
                {formatTimeLabel(hour)}
              </Typography>
            ))}
          </Box>

          {/* Day columns */}
          {DAY_COLUMNS.map((day, idx) => (
            <Box
              key={day}
              sx={{
                position: "relative",
                height: gridHeight,
                borderLeft: "1px solid",
                borderRight: idx === DAY_COLUMNS.length - 1 ? "1px solid" : undefined,
                borderColor: "divider",
              }}
            >
              {/* Hour gridlines (skip first to avoid top border) */}
              {hours.map((hour) =>  (
                <Box
                  key={hour}
                  sx={{
                    position: "absolute",
                    top: (hour - startHour) * PIXELS_PER_HOUR,
                    left: 0,
                    right: 0,
                    borderTop: "1px solid",
                    borderColor: "divider",
                  }}
                />
              ))}

              {/* Class blocks */}
              {classesByDay[day]?.map((cls) => (
                <CalendarClassBlock
                  key={cls.id}
                  classData={cls}
                  startHour={startHour}
                  pixelsPerHour={PIXELS_PER_HOUR}
                />
              ))}
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyCalendar;
