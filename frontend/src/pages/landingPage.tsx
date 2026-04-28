import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Tooltip from "@mui/material/Tooltip";
import ViewModuleIcon from "@mui/icons-material/ViewModuleOutlined";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeekOutlined";
import { useNavigate } from "react-router-dom";
import { fetchClasses, fetchExams, fetchExtraLessons, deleteExam as apiDeleteExam, deleteExtraLesson as apiDeleteExtraLesson } from "../services/api";
import type { ClassData } from "./classPage/types";
import type { ApiExam, ApiExtraLesson } from "../services/api";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import DeleteIcon from "@mui/icons-material/DeleteOutlined";
import AddIcon from "@mui/icons-material/Add";
import QuizIcon from "@mui/icons-material/QuizOutlined";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import StatusDot from "../components/StatusDot";
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
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Skeleton variant="text" width={240} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={360} sx={{ mb: 8 }} />
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "1fr 1fr",
              md: "1fr 1fr 1fr",
            },
            gap: 4,
          }}
        >
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="rounded" height={100} />
          ))}
        </Box>
      </Container>
    );
  }

  return (
    <Box sx={{ pt: 6, pb: 8 }}>
      <Box sx={{ pb: 4 }}>
        <Container maxWidth="lg">
          {isDemo && (
            <Box
              sx={{
                mb: 6,
                px: 4,
                py: 3,
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
                display: "flex",
                alignItems: "center",
                gap: 3,
              }}
            >
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  bgcolor: "info.main",
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" color="text.secondary">
                You're exploring in demo mode. Sign up to create your own classes.
              </Typography>
            </Box>
          )}
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
              gap: 4,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
                Home
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Your classes, calendar, and upcoming exams.
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
              {viewMode === "calendar" && isAdmin && (
                <>
                  <Tooltip title="Add">
                    <IconButton
                      size="small"
                      onClick={(e) => setAddMenuAnchor(e.currentTarget)}
                      sx={{
                        border: 1,
                        borderColor: "divider",
                        borderRadius: 1.5,
                      }}
                    >
                      <AddIcon sx={{ fontSize: 18 }} />
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={addMenuAnchor}
                    open={Boolean(addMenuAnchor)}
                    onClose={() => setAddMenuAnchor(null)}
                  >
                    <MenuItem
                      onClick={() => {
                        setAddMenuAnchor(null);
                        setAddExamOpen(true);
                      }}
                    >
                      <ListItemIcon>
                        <QuizIcon fontSize="small" />
                      </ListItemIcon>
                      <ListItemText>Add Exam</ListItemText>
                    </MenuItem>
                    <MenuItem
                      onClick={() => {
                        setAddMenuAnchor(null);
                        setAddExtraLessonOpen(true);
                      }}
                    >
                      <ListItemIcon>
                        <SchoolIcon fontSize="small" />
                      </ListItemIcon>
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
                  <ViewModuleIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
                <ToggleButton value="calendar" aria-label="calendar view">
                  <CalendarViewWeekIcon sx={{ fontSize: 18 }} />
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
          </Box>
        </Container>
      </Box>

      {viewMode === "grid" ? (
        <Container maxWidth="lg">
          {classes.length === 0 && !isAdmin && (
            <Box
              sx={{
                py: 12,
                px: 4,
                textAlign: "center",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
              }}
            >
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                No classes assigned yet
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Contact your admin to get access to a class.
              </Typography>
            </Box>
          )}
          <Grid container spacing={4}>
            {classes.map((cls) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.id}>
                <Card
                  sx={{
                    height: 110,
                    transition: "border-color 150ms",
                    "&:hover": { borderColor: "text.disabled" },
                  }}
                >
                  <CardActionArea
                    onClick={() => navigate(`/classOverview/${cls.id}`)}
                    sx={{ height: "100%", p: 4 }}
                  >
                    <CardContent sx={{ p: 0 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, mb: 0.5 }}
                      >
                        {cls.classLevel}
                      </Typography>
                      {cls.label && (
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          sx={{ display: "block", mb: 0.5 }}
                        >
                          {cls.label}
                        </Typography>
                      )}
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                      >
                        {cls.dayOfWeek} · {cls.startTime}–{cls.endTime}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      ) : (
        <Box
          sx={{
            display: "flex",
            px: { xs: 4, md: 6 },
            gap: 6,
            flexDirection: { xs: "column", lg: "row" },
          }}
        >
          {/* Calendar */}
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
          <Box sx={{ width: { xs: "100%", lg: 280 }, flexShrink: 0 }}>
            <Typography
              variant="overline"
              color="text.disabled"
              sx={{ display: "block", mb: 3 }}
            >
              Upcoming Exams
            </Typography>
            {upcomingExams.length === 0 ? (
              <Typography variant="body2" color="text.secondary">
                No upcoming exams.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {upcomingExams.map((exam) => {
                  const countdown = daysUntil(exam.examDate);
                  const isUrgent =
                    countdown === "Today" || countdown === "Tomorrow";
                  return (
                    <Card key={exam.id} sx={{ px: 3, py: 2.5 }}>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
                        <Box sx={{ minWidth: 0, flex: 1 }}>
                          <Typography
                            variant="body1"
                            sx={{ fontWeight: 500, lineHeight: 1.3, mb: 0.5 }}
                          >
                            {exam.title}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ display: "block", mb: 1 }}
                          >
                            {exam.classLevel}
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {new Date(
                                exam.examDate + "T00:00:00",
                              ).toLocaleDateString("en-AU", {
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                              })}
                            </Typography>
                            <StatusDot
                              kind={isUrgent ? "warning" : "neutral"}
                              label={countdown}
                            />
                          </Box>
                        </Box>
                        {isAdmin && (
                          <Tooltip title="Delete exam">
                            <IconButton
                              size="small"
                              onClick={() => setPendingDeleteExam(exam)}
                            >
                              <DeleteIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                          </Tooltip>
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
