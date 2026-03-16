import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import type { ClassData } from "../../pages/classPage/types";
import type { ApiExam } from "../../services/api";
import {
  formatDateISO,
  formatDayHeader,
  formatTimeLabel,
  getWeekDates,
  isSameDate,
  parseTime,
} from "./calendarUtils";
import CalendarClassBlock from "./CalendarClassBlock";
import CalendarExamBlock from "./CalendarExamBlock";

interface Props {
  classes: ClassData[];
  exams: ApiExam[];
  weekStart: Date;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onToday: () => void;
}

const PIXELS_PER_HOUR = 48;
const TIME_COL_WIDTH = 44;
const DAY_COL_MIN_WIDTH = 110;
const DEFAULT_START_HOUR = 9;
const DEFAULT_END_HOUR = 20;

function formatWeekRange(weekDates: Date[]): string {
  const start = weekDates[0];
  const end = weekDates[6];

  const startDay = start.getDate();
  const endDay = end.getDate();
  const startMonth = start.toLocaleDateString("en-US", { month: "short" });
  const endMonth = end.toLocaleDateString("en-US", { month: "short" });
  const startYear = start.getFullYear();
  const endYear = end.getFullYear();

  if (startYear === endYear && startMonth === endMonth) {
    return `${startDay}-${endDay} ${startMonth} ${startYear}`;
  }
  if (startYear === endYear) {
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${startYear}`;
  }
  return `${startDay} ${startMonth} ${startYear} - ${endDay} ${endMonth} ${endYear}`;
}

const WeeklyCalendar = ({ classes, exams, weekStart, onPrevWeek, onNextWeek, onToday }: Props) => {
  const today = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekRange(weekDates), [weekDates]);

  const { startHour, endHour, classesByDate, examsByDate } = useMemo(() => {
    let minHour = DEFAULT_START_HOUR;
    let maxHour = DEFAULT_END_HOUR;

    const classesByDayName: Record<string, ClassData[]> = {
      Monday: [],
      Tuesday: [],
      Wednesday: [],
      Thursday: [],
      Friday: [],
      Saturday: [],
      Sunday: [],
    };
    const byDateClasses: Record<string, ClassData[]> = {};
    const byDateExams: Record<string, ApiExam[]> = {};

    for (const cls of classes) {
      const startMin = parseTime(cls.startTime);
      const endMin = parseTime(cls.endTime);
      const sHour = Math.floor(startMin / 60);
      const eHour = Math.ceil(endMin / 60);
      if (sHour < minHour) minHour = sHour;
      if (eHour > maxHour) maxHour = eHour;
      if (classesByDayName[cls.dayOfWeek]) {
        classesByDayName[cls.dayOfWeek].push(cls);
      }
    }

    for (const date of weekDates) {
      const dateKey = formatDateISO(date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      byDateClasses[dateKey] = classesByDayName[dayName] ?? [];
      byDateExams[dateKey] = [];
    }

    for (const exam of exams) {
      if (byDateExams[exam.examDate]) {
        byDateExams[exam.examDate].push(exam);
      }
    }

    return { startHour: minHour, endHour: maxHour, classesByDate: byDateClasses, examsByDate: byDateExams };
  }, [classes, exams, weekDates]);

  const totalHours = endHour - startHour;
  const gridHeight = totalHours * PIXELS_PER_HOUR;
  const hours = Array.from({ length: totalHours + 1 }, (_, i) => startHour + i);

  return (
    <Box sx={{ width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Button onClick={onToday} size="small" variant="outlined">Today</Button>
        </Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
          {weekLabel}
        </Typography>
        <Box sx={{ flex: 1, display: "flex", justifyContent: "flex-end", gap: 0.5 }}>
          <Button onClick={onPrevWeek} size="small" variant="outlined">{"<"}</Button>
          <Button onClick={onNextWeek} size="small" variant="outlined">{">"}</Button>
        </Box>
      </Box>

      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
            borderColor: "divider",
          }}
        >
          <Box />
          {weekDates.map((date, idx) => {
            const dateKey = formatDateISO(date);
            return (
            <Box
              key={dateKey}
              sx={{
                py: 1,
                px: 1,
                textAlign: "center",
                borderTop: "1px solid",
                borderLeft: "1px solid",
                borderRight: idx === weekDates.length - 1 ? "1px solid" : undefined,
                borderColor: "divider",
                ...(isSameDate(date, today) && { backgroundColor: "rgba(255, 160, 113, 0.12)" }),
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: isSameDate(date, today) ? 800 : 600,
                  color: isSameDate(date, today) ? "primary.main" : undefined,
                }}
              >
                {formatDayHeader(date)}
              </Typography>
              {examsByDate[dateKey]?.length ? (
                <Box sx={{ mt: 0.75, display: "flex", flexDirection: "column", gap: 0.5, textAlign: "left" }}>
                  {examsByDate[dateKey].map((exam) => (
                    <CalendarExamBlock key={exam.id} exam={exam} />
                  ))}
                </Box>
              ) : null}
            </Box>
          );
          })}
        </Box>

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `${TIME_COL_WIDTH}px repeat(7, minmax(${DAY_COL_MIN_WIDTH}px, 1fr))`,
            position: "relative",
          }}
        >
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

          {weekDates.map((date, idx) => {
            const dateKey = formatDateISO(date);
            return (
            <Box
              key={dateKey}
              sx={{
                position: "relative",
                height: gridHeight,
                borderLeft: "1px solid",
                borderRight: idx === weekDates.length - 1 ? "1px solid" : undefined,
                borderColor: "divider",
                ...(isSameDate(date, today) && { backgroundColor: "rgba(255, 160, 113, 0.05)" }),
              }}
            >
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

              {classesByDate[dateKey]?.map((cls) => (
                <CalendarClassBlock
                  key={cls.id}
                  classData={cls}
                  startHour={startHour}
                  pixelsPerHour={PIXELS_PER_HOUR}
                />
              ))}
            </Box>
          );
          })}
        </Box>
      </Box>
    </Box>
  );
};

export default WeeklyCalendar;
