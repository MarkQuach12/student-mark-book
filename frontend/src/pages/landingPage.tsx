import { useCallback, useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import { useNavigate } from "react-router-dom";
import { fetchClasses, fetchExams } from "../services/api";
import type { ClassData } from "./classPage/types";
import type { ApiExam } from "../services/api";
import WeeklyCalendar from "../components/calendar/WeeklyCalendar";
import AddExamDialog from "../components/calendar/AddExamDialog";
import { formatDateISO, getMonday, getWeekDates } from "../components/calendar/calendarUtils";

const LandingPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [exams, setExams] = useState<ApiExam[]>([]);
  const [loading, setLoading] = useState(true);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [weekStart, setWeekStart] = useState<Date>(() => getMonday(new Date()));
  const [viewMode, setViewMode] = useState<"grid" | "calendar">(
    () => (localStorage.getItem("landingViewMode") as "grid" | "calendar") || "grid"
  );

  const CLASS_ORDER = useMemo(() => [
    "Y12 Extension 2",
    "Y12 Extension 1",
    "Y12 Advanced",
    "Y12 Standard",
    "Y11 Extension 1",
    "Y11 Advanced",
    "Y11 Standard",
  ], []);

  const loadClasses = useCallback(async () => {
    try {
      const data = await fetchClasses();
      data.sort((a, b) => {
        const ai = CLASS_ORDER.indexOf(a.classLevel);
        const bi = CLASS_ORDER.indexOf(b.classLevel);
        return (ai === -1 ? CLASS_ORDER.length : ai) - (bi === -1 ? CLASS_ORDER.length : bi);
      });
      setClasses(data);
    } catch {
      // Could show error toast
    } finally {
      setLoading(false);
    }
  }, [CLASS_ORDER]);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  const loadExams = useCallback(async () => {
    const weekDates = getWeekDates(weekStart);
    const start = formatDateISO(weekDates[0]);
    const end = formatDateISO(weekDates[6]);

    try {
      const data = await fetchExams(start, end);
      setExams(data);
    } catch {
      // Could show error toast
    }
  }, [weekStart]);

  useEffect(() => {
    if (viewMode !== "calendar") return;
    loadExams();
  }, [viewMode, loadExams]);

  useEffect(() => {
    const refresh = () => { loadClasses(); };
    window.addEventListener("classCreated", refresh);
    window.addEventListener("classDeleted", refresh);
    return () => {
      window.removeEventListener("classCreated", refresh);
      window.removeEventListener("classDeleted", refresh);
    };
  }, [loadClasses]);

  useEffect(() => {
    const refreshExams = () => { loadExams(); };
    window.addEventListener("examCreated", refreshExams);
    window.addEventListener("examDeleted", refreshExams);
    return () => {
      window.removeEventListener("examCreated", refreshExams);
      window.removeEventListener("examDeleted", refreshExams);
    };
  }, [loadExams]);

  const handlePrevWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() - 7);
      return next;
    });
  };

  const handleNextWeek = () => {
    setWeekStart((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 7);
      return next;
    });
  };

  const handleToday = () => {
    setWeekStart(getMonday(new Date()));
  };

  if (loading) {
    return (
      <Box sx={{ pt: 12, pb: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ pt: 12, pb: 4 }}>
      <Box sx={{ pb: 1 }}>
        <Container maxWidth="md">
          <Box sx={{ position: "relative", mb: 1 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h4" component="h1">
                MQ Student Mark Book
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your classes and student marks in one place.
              </Typography>
            </Box>
            <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 1 }}>
              {viewMode === "calendar" && (
                <Button variant="contained" size="small" onClick={() => setAddExamOpen(true)}>
                  Add Exam
                </Button>
              )}
              <ToggleButtonGroup
                value={viewMode}
                exclusive
                onChange={(_, v: "grid" | "calendar" | null) => {
                  if (v) {
                    setViewMode(v);
                    localStorage.setItem("landingViewMode", v);
                  }
                }}
                size="small"
              >
                <ToggleButton value="grid" aria-label="grid view">
                  <ViewModuleIcon />
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="calendar view">
                  <CalendarViewWeekIcon />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Container>
      </Box>

      {viewMode === "grid" ? (
        <Container maxWidth="md">
          <Grid container spacing={2}>
            {classes.map((cls) => (
              <Grid size={{ xs: 12, sm: 4, md: 4 }} key={cls.id}>
                <Card
                  variant="outlined"
                  sx={{
                    height: 120,
                    transition: "box-shadow 0.2s, border-color 0.2s",
                    "&:hover": {
                      borderColor: "primary.main",
                      boxShadow: 2,
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/classOverview/${cls.id}`)}
                    sx={{ height: "100%" }}
                  >
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h6" gutterBottom>
                        {cls.classLevel}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {cls.dayOfWeek} {cls.startTime}–{cls.endTime}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : (
        <Box sx={{ px: 2 }}>
          <WeeklyCalendar
            classes={classes}
            exams={exams}
            weekStart={weekStart}
            onPrevWeek={handlePrevWeek}
            onNextWeek={handleNextWeek}
            onToday={handleToday}
          />
        </Box>
      )}
      <AddExamDialog open={addExamOpen} onClose={() => setAddExamOpen(false)} />
    </Box>
  );
};

export default LandingPage;
