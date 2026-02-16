import { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardContent from "@mui/material/CardContent";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";
import { getClasses } from "../utils/classStorage";
import type { ClassData } from "./classPage/types";

const LandingPage = () => {
  const navigate = useNavigate();
  const [classes, setClasses] = useState<ClassData[]>(() => getClasses());

  useEffect(() => {
    const refresh = () => setClasses(getClasses());
    window.addEventListener("classCreated", refresh);
    return () => window.removeEventListener("classCreated", refresh);
  }, []);

  return (
    <Box sx={{ pt: 12, pb: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          MQ Student Mark Book
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Manage your classes and student marks in one place.
        </Typography>

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
                      {cls.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {cls.students.length}{" "}
                      {cls.students.length === 1 ? "student" : "students"}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};

export default LandingPage;
