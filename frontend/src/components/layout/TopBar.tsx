import { useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import MenuIcon from "@mui/icons-material/Menu";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { getInitials } from "../../utils/stringUtils";
import Breadcrumbs from "./Breadcrumbs";
import ThemeToggle from "./ThemeToggle";

interface TopBarProps {
  onOpenSidebar: () => void;
}

export default function TopBar({ onOpenSidebar }: TopBarProps) {
  const navigate = useNavigate();
  const { user, clearUser } = useAuth();
  const [anchor, setAnchor] = useState<HTMLElement | null>(null);

  const handleLogout = () => {
    setAnchor(null);
    clearUser();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        height: 56,
        flexShrink: 0,
        bgcolor: "background.default",
        borderBottom: 1,
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        px: { xs: 3, md: 4 },
        gap: 3,
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <IconButton
        size="small"
        onClick={onOpenSidebar}
        sx={{ display: { xs: "inline-flex", md: "none" } }}
        aria-label="Open menu"
      >
        <MenuIcon sx={{ fontSize: 20 }} />
      </IconButton>

      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Breadcrumbs />
      </Box>

      <ThemeToggle />

      {user && (
        <>
          <Tooltip title="Account">
            <IconButton
              size="small"
              onClick={(e) => setAnchor(e.currentTarget)}
              sx={{ p: 0 }}
            >
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  fontSize: 12,
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                }}
              >
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchor}
            open={Boolean(anchor)}
            onClose={() => setAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem
              component={Link}
              to="/settings"
              onClick={() => setAnchor(null)}
            >
              Settings
            </MenuItem>
            <MenuItem onClick={handleLogout}>Logout</MenuItem>
          </Menu>
        </>
      )}
    </Box>
  );
}
