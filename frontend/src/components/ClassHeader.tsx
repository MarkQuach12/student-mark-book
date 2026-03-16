import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import PersonAddAlt1Icon from "@mui/icons-material/PersonAddAlt1";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import DeleteForeverIcon from "@mui/icons-material/DeleteForever";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface ClassHeaderProps {
  className: string;
  studentCount: number;
  onAddStudent: () => void;
  onRemoveStudent: () => void;
  onDeleteClass: () => void;
}

export default function ClassHeader({ className, studentCount, onAddStudent, onRemoveStudent, onDeleteClass }: ClassHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h5" component="h1" gutterBottom sx={{ textAlign: "center" }}>
        {className}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Typography variant="body2" color="text.secondary">
          {studentCount} students
        </Typography>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <Button
            size="small"
            variant="contained"
            disableElevation
            startIcon={<PersonAddAlt1Icon />}
            onClick={onAddStudent}
            sx={{ textTransform: "none", borderRadius: 2 }}
          >
            Add Student
          </Button>
          <IconButton
            size="small"
            onClick={(e) => setAnchorEl(e.currentTarget)}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 2,
              ml: 0.5,
            }}
          >
            <MoreVertIcon fontSize="small" />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: { borderRadius: 2, minWidth: 200, mt: 0.5 },
              },
            }}
          >
            <MenuItem
              onClick={() => { handleMenuClose(); onRemoveStudent(); }}
            >
              <ListItemIcon>
                <PersonRemoveIcon fontSize="small" color="warning" />
              </ListItemIcon>
              <ListItemText>Remove Student</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => { handleMenuClose(); onDeleteClass(); }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Class</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Box>
  );
}
