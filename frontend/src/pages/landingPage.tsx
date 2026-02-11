import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

const LandingPage = () => {
  return (
    <Box sx={{ pt: 12, pb: 4 }}>
      <Container maxWidth="md">
        <Typography variant="h4" component="h1" gutterBottom>
          MQ Student Mark Book
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your classes and student marks in one place.
        </Typography>
      </Container>
    </Box>
  );
};

export default LandingPage;