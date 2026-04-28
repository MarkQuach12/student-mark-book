import { useMemo } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Typography from "@mui/material/Typography";
import type { ClassData } from "../../pages/classPage/types";
import type { ApiExam, ApiExtraLesson } from "../../services/api";
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
import CalendarExtraLessonBlock from "./CalendarExtraLessonBlock";

interface Props {
  classes: ClassData[];
  exams: ApiExam[];
  extraLessons?: ApiExtraLesson[];
  isAdmin?: boolean;
  onExtraLessonDelete?: (id: string) => void;
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

const WeeklyCalendar = ({ classes, exams, extraLessons = [], isAdmin = false, onExtraLessonDelete, weekStart, onPrevWeek, onNextWeek, onToday }: Props) => {
  const today = useMemo(() => new Date(), []);
  const weekDates = useMemo(() => getWeekDates(weekStart), [weekStart]);
  const weekLabel = useMemo(() => formatWeekRange(weekDates), [weekDates]);

  const { startHour, endHour, classesByDate, examsByDate, extraLessonsByDate } = useMemo(() => {
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
    const byDateExtraLessons: Record<string, ApiExtraLesson[]> = {};

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

    for (const lesson of extraLessons) {
      const startMin = parseTime(lesson.startTime);
      const endMin = parseTime(lesson.endTime);
      const sHour = Math.floor(startMin / 60);
      const eHour = Math.ceil(endMin / 60);
      if (sHour < minHour) minHour = sHour;
      if (eHour > maxHour) maxHour = eHour;
    }

    for (const date of weekDates) {
      const dateKey = formatDateISO(date);
      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      byDateClasses[dateKey] = classesByDayName[dayName] ?? [];
      byDateExams[dateKey] = [];
      byDateExtraLessons[dateKey] = [];
    }

    for (const exam of exams) {
      if (byDateExams[exam.examDate]) {
        byDateExams[exam.examDate].push(exam);
      }
    }

    for (const lesson of extraLessons) {
      if (byDateExtraLessons[lesson.lessonDate]) {
        byDateExtraLessons[lesson.lessonDate].push(lesson);
      }
    }

    return { startHour: minHour, endHour: maxHour, classesByDate: byDateClasses, examsByDate: byDateExams, extraLessonsByDate: byDateExtraLessons };
  }, [classes, exams, extraLessons, weekDates]);

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
          <IconButton onClick={onPrevWeek} size="small" sx={{ border: 1, borderColor: "divider", borderRadius: 1, width: 32, height: 32 }}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={onNextWeek} size="small" sx={{ border: 1, borderColor: "divider", borderRadius: 1, width: 32, height: 32 }}>
            <ChevronRightIcon fontSize="small" />
          </IconButton>
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
                ...(isSameDate(date, today) && {
                  backgroundColor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(59, 111, 160, 0.10)"
                      : "#EEF2F7",
                }),
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
                  color: "text.disabled",
                  fontSize: "0.6875rem",
                  fontFamily: "'JetBrains Mono', monospace",
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
                ...(isSameDate(date, today) && {
                  backgroundColor: (t) =>
                    t.palette.mode === "dark"
                      ? "rgba(59, 111, 160, 0.05)"
                      : "#F4F7FB",
                }),
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

              {extraLessonsByDate[dateKey]?.map((lesson) => (
                <CalendarExtraLessonBlock
                  key={lesson.id}
                  extraLesson={lesson}
                  startHour={startHour}
                  pixelsPerHour={PIXELS_PER_HOUR}
                  isAdmin={isAdmin}
                  onDelete={onExtraLessonDelete}
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
