import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";

interface ClassHeaderProps {
  className: string;
  studentCount: number;
  totalHomework: number;
  onAddStudent: () => void;
  onRemoveStudent: () => void;
}

export default function ClassHeader({ className, studentCount, totalHomework, onAddStudent, onRemoveStudent }: ClassHeaderProps) {
  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        {className}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {studentCount} students · {totalHomework} homework items
        </Typography>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Button size="small" variant="outlined" onClick={onAddStudent}>
            + Add Student
          </Button>
          <Button size="small" variant="outlined" color="error" onClick={onRemoveStudent}>
            - Remove Student
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
