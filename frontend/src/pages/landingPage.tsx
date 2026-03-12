import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import CircularProgress from "@mui/material/CircularProgress";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import Typography from "@mui/material/Typography";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import CalendarViewWeekIcon from "@mui/icons-material/CalendarViewWeek";
import { useNavigate } from "react-router-dom";
import { fetchClasses } from "../services/api";
import type { ClassData } from "./classPage/types";
import WeeklyCalendar from "../components/calendar/WeeklyCalendar";

const LandingPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "calendar">(
    () => (localStorage.getItem("landingViewMode") as "grid" | "calendar") || "grid"
  );

  const loadClasses = useCallback(async () => {
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch {
      // Could show error toast
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    const refresh = () => { loadClasses(); };
    window.addEventListener("classCreated", refresh);
    return () => window.removeEventListener("classCreated", refresh);
  }, [loadClasses]);

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
              sx={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)" }}
            >
              <ToggleButton value="grid" aria-label="grid view">
                <ViewModuleIcon />
              </ToggleButton>
              <ToggleButton value="calendar" aria-label="calendar view">
                <CalendarViewWeekIcon />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Container>
      </Box>

      {viewMode === "grid" ? (
        <Container maxWidth="md">
          <Grid container spacing={2}>
            {classes.map((cls) => (
              <Grid size={{ xs: 12, sm: 6, md: 4 }} key={cls.id}>
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
                    <CardContent>
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
          <WeeklyCalendar classes={classes} />
        </Box>
      )}
    </Box>
  );
};

export default LandingPage;