import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import PersonRemoveIcon from "@mui/icons-material/PersonRemoveOutlined";
import DeleteForeverIcon from "@mui/icons-material/DeleteForeverOutlined";
import MoreVertIcon from "@mui/icons-material/MoreVert";

interface ClassHeaderProps {
  className: string;
  label?: string;
  studentCount: number;
  onRemoveStudent: () => void;
  onDeleteClass: () => void;
  isAdmin: boolean;
}

export default function ClassHeader({
  className,
  label,
  studentCount,
  onRemoveStudent,
  onDeleteClass,
  isAdmin,
}: ClassHeaderProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const handleMenuClose = () => setAnchorEl(null);

  return (
    <Box
      sx={{
        mb: 6,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 4,
        flexWrap: "wrap",
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
          {className}
        </Typography>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          {label && (
            <Typography variant="body2" color="text.secondary">
              {label}
            </Typography>
          )}
          {label && isAdmin && (
            <Typography variant="body2" color="text.disabled">
              ·
            </Typography>
          )}
          {isAdmin && (
            <Typography variant="body2" color="text.secondary">
              {studentCount} student{studentCount === 1 ? "" : "s"}
            </Typography>
          )}
        </Box>
      </Box>

      {isAdmin && (
        <Box>
          <Tooltip title="Class actions">
            <IconButton
              size="small"
              onClick={(e) => setAnchorEl(e.currentTarget)}
              sx={{
                border: 1,
                borderColor: "divider",
                borderRadius: 1.5,
              }}
            >
              <MoreVertIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={menuOpen}
            onClose={handleMenuClose}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{ paper: { sx: { minWidth: 200, mt: 0.5 } } }}
          >
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onRemoveStudent();
              }}
            >
              <ListItemIcon>
                <PersonRemoveIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Remove Student</ListItemText>
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                handleMenuClose();
                onDeleteClass();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <DeleteForeverIcon fontSize="small" color="error" />
              </ListItemIcon>
              <ListItemText>Delete Class</ListItemText>
            </MenuItem>
          </Menu>
        </Box>
      )}
    </Box>
  );
}
