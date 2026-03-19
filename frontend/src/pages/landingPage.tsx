import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
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
import { fetchClasses, fetchExams, fetchExtraLessons, deleteExam as apiDeleteExam, deleteExtraLesson as apiDeleteExtraLesson } from "../services/api";
import type { ClassData } from "./classPage/types";
import type { ApiExam, ApiExtraLesson } from "../services/api";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import QuizIcon from "@mui/icons-material/Quiz";
import SchoolIcon from "@mui/icons-material/School";
import Alert from "@mui/material/Alert";
import WeeklyCalendar from "../components/calendar/WeeklyCalendar";
import AddExamDialog from "../components/calendar/AddExamDialog";
import AddExtraLessonDialog from "../components/calendar/AddExtraLessonDialog";
import { formatDateISO, getMonday, getWeekDates } from "../components/calendar/calendarUtils";

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAdmin, isDemo } = useAuth();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [exams, setExams] = useState<ApiExam[]>([]);
  const [allExams, setAllExams] = useState<ApiExam[]>([]);
  const [extraLessons, setExtraLessons] = useState<ApiExtraLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [addExamOpen, setAddExamOpen] = useState(false);
  const [addExtraLessonOpen, setAddExtraLessonOpen] = useState(false);
  const [pendingDeleteExam, setPendingDeleteExam] = useState<ApiExam | null>(null);
  const [addMenuAnchor, setAddMenuAnchor] = useState<null | HTMLElement>(null);
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

  const loadExtraLessons = useCallback(async () => {
    const weekDates = getWeekDates(weekStart);
    const start = formatDateISO(weekDates[0]);
    const end = formatDateISO(weekDates[6]);

    try {
      const data = await fetchExtraLessons(start, end);
      setExtraLessons(data);
    } catch {
      // Could show error toast
    }
  }, [weekStart]);

  const loadAllExams = useCallback(async () => {
    try {
      const data = await fetchExams();
      setAllExams(data);
    } catch {
      // Could show error toast
    }
  }, []);

  useEffect(() => {
    if (viewMode !== "calendar") return;
    loadExams();
    loadAllExams();
    loadExtraLessons();
  }, [viewMode, loadExams, loadAllExams, loadExtraLessons]);

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
    const refreshExams = () => { loadExams(); loadAllExams(); };
    window.addEventListener("examCreated", refreshExams);
    window.addEventListener("examDeleted", refreshExams);
    return () => {
      window.removeEventListener("examCreated", refreshExams);
      window.removeEventListener("examDeleted", refreshExams);
    };
  }, [loadExams, loadAllExams]);

  useEffect(() => {
    const refreshExtraLessons = () => { loadExtraLessons(); };
    window.addEventListener("extraLessonCreated", refreshExtraLessons);
    window.addEventListener("extraLessonDeleted", refreshExtraLessons);
    return () => {
      window.removeEventListener("extraLessonCreated", refreshExtraLessons);
      window.removeEventListener("extraLessonDeleted", refreshExtraLessons);
    };
  }, [loadExtraLessons]);

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

  const confirmDeleteExam = async () => {
    if (!pendingDeleteExam) return;
    try {
      await apiDeleteExam(pendingDeleteExam.id);
      setAllExams((prev) => prev.filter((e) => e.id !== pendingDeleteExam.id));
      setExams((prev) => prev.filter((e) => e.id !== pendingDeleteExam.id));
      window.dispatchEvent(new Event("examDeleted"));
    } catch {
      // Could show error toast
    } finally {
      setPendingDeleteExam(null);
    }
  };

  const handleDeleteExtraLesson = async (id: string) => {
    try {
      await apiDeleteExtraLesson(id);
      setExtraLessons((prev) => prev.filter((l) => l.id !== id));
      window.dispatchEvent(new Event("extraLessonDeleted"));
    } catch {
      // Could show error toast
    }
  };

  const upcomingExams = useMemo(() => {
    const today = formatDateISO(new Date());
    return allExams
      .filter((e) => e.examDate >= today)
      .sort((a, b) => a.examDate.localeCompare(b.examDate));
  }, [allExams]);

  function daysUntil(examDate: string): string {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const exam = new Date(examDate + "T00:00:00");
    const diff = Math.round((exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Today";
    if (diff === 1) return "Tomorrow";
    return `${diff} days`;
  }

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
          {isDemo && (
            <Alert severity="info" sx={{ mb: 1 }}>
              You're exploring in demo mode. Sign up to create your own classes.
            </Alert>
          )}
          <Box sx={{ position: "relative", mb: 1 }}>
            <Box sx={{ textAlign: "center" }}>
              <Typography variant="h5" component="h1">
                MQ Student Mark Book
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Manage your classes and student marks in one place.
              </Typography>
            </Box>
            <Box sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", gap: 1 }}>
              {viewMode === "calendar" && isAdmin && (
                <>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                    sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}
                  >
                    <AddIcon />
                  </IconButton>
                  <Menu
                    anchorEl={addMenuAnchor}
                    open={Boolean(addMenuAnchor)}
                    onClose={() => setAddMenuAnchor(null)}
                  >
                    <MenuItem onClick={() => { setAddMenuAnchor(null); setAddExamOpen(true); }}>
                      <ListItemIcon><QuizIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Add Exam</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => { setAddMenuAnchor(null); setAddExtraLessonOpen(true); }}>
                      <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
                      <ListItemText>Add Extra Lesson</ListItemText>
                    </MenuItem>
                  </Menu>
                </>
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
          {classes.length === 0 && !isAdmin && (
            <Typography color="text.secondary" sx={{ textAlign: "center", mt: 4 }}>
              No classes assigned yet. Contact your admin to get access.
            </Typography>
          )}
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
                      <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600 }}>
                        {cls.classLevel}
                      </Typography>
                      {cls.label && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.5, fontStyle: "italic" }}>
                          {cls.label}
                        </Typography>
                      )}
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
        <Box sx={{ display: "flex", px: 3, gap: 3 }}>
          {/* Calendar — takes remaining space */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <WeeklyCalendar
              classes={classes}
              exams={exams}
              extraLessons={extraLessons}
              isAdmin={isAdmin}
              onExtraLessonDelete={handleDeleteExtraLesson}
              weekStart={weekStart}
              onPrevWeek={handlePrevWeek}
              onNextWeek={handleNextWeek}
              onToday={handleToday}
            />
          </Box>

          {/* Upcoming Exams sidebar */}
          <Box sx={{ width: 260, flexShrink: 0 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
              Upcoming Exams
            </Typography>
            {upcomingExams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming exams.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {upcomingExams.map((exam) => {
                  const countdown = daysUntil(exam.examDate);
                  const isUrgent = countdown === "Today" || countdown === "Tomorrow";
                  return (
                    <Card key={exam.id} variant="outlined" sx={{ px: 1.5, py: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.3 }}>
                            {exam.title}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {exam.classLevel}
                          </Typography>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                            <Typography variant="caption" color="text.secondary">
                              {new Date(exam.examDate + "T00:00:00").toLocaleDateString("en-AU", { weekday: "short", day: "numeric", month: "short" })}
                            </Typography>
                            <Chip
                              label={countdown}
                              size="small"
                              color={isUrgent ? "warning" : "default"}
                              variant={isUrgent ? "filled" : "outlined"}
                              sx={{ height: 18, fontSize: "0.65rem" }}
                            />
                          </Box>
                        </Box>
                        {isAdmin && (
                          <IconButton size="small" color="error" onClick={() => setPendingDeleteExam(exam)} sx={{ ml: 0.5, mt: -0.5 }}>
                            <DeleteIcon sx={{ fontSize: 16 }} />
                          </IconButton>
                        )}
                      </Box>
                    </Card>
                  );
                })}
              </Box>
            )}
          </Box>
        </Box>
      )}
      <Dialog open={pendingDeleteExam !== null} onClose={() => setPendingDeleteExam(null)}>
        <DialogTitle>Delete Exam?</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{pendingDeleteExam?.title}</strong> ({pendingDeleteExam?.classLevel})?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPendingDeleteExam(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={confirmDeleteExam}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
      <AddExamDialog open={addExamOpen} onClose={() => setAddExamOpen(false)} classes={classes} />
      <AddExtraLessonDialog
        open={addExtraLessonOpen}
        classes={classes}
        onClose={() => setAddExtraLessonOpen(false)}
        onCreated={() => loadExtraLessons()}
      />
    </Box>
  );
};

export default LandingPage;
