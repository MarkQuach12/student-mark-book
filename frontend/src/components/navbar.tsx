import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import AddIcon from "@mui/icons-material/Add";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getInitials } from "../utils/stringUtils";
import CreateClassModal from "./CreateClassModal";

export default function Navbar() {
  const navigate = useNavigate();
  const { user: currentUser, clearUser } = useAuth();
  const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);
  const [modalOpen, setModalOpen] = React.useState(false);

  const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleLogout = () => {
    handleCloseUserMenu();
    clearUser();
    navigate("/login", { replace: true });
  };

  return (
    <>
      <AppBar position="fixed">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Typography
              variant="h6"
              noWrap
              sx={{
                mr: 2,
                fontFamily: "Segoe UI",
                fontWeight: 700,
                color: "inherit",
                textDecoration: "none",
                "&:hover": {
                  color: "primary.contrastText",
                },
              }}
              component={Link}
              to="/"
              color="inherit"
            >
              MQ Student Mark Book
            </Typography>

            <Box sx={{ flexGrow: 1 }} />

            {currentUser && (
              <Button
                variant="contained"
                size="small"
                startIcon={<AddIcon />}
                onClick={() => setModalOpen(true)}
                sx={{
                  mr: 2,
                  bgcolor: "primary.dark",
                  "&:hover": { bgcolor: "primary.main" },
                }}
              >
                Create New Class
              </Button>
            )}

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {currentUser ? (
                <>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar
                        alt={currentUser.name}
                        sx={{ bgcolor: "primary.dark" }}
                      >
                        {getInitials(currentUser.name)}
                      </Avatar>
                    </IconButton>
                  </Tooltip>
                  <Menu
                    sx={{ mt: "45px" }}
                    id="menu-appbar"
                    anchorEl={anchorElUser}
                    anchorOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: "top",
                      horizontal: "right",
                    }}
                    open={Boolean(anchorElUser)}
                    onClose={handleCloseUserMenu}
                  >
                    <MenuItem component={Link} to="/profile" onClick={handleCloseUserMenu}>
                      <Typography sx={{ textAlign: "center", color: "black" }}>
                        Profile
                      </Typography>
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <Typography sx={{ textAlign: "center", color: "black" }}>
                        Logout
                      </Typography>
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button color="inherit" component={Link} to="/login">
                    Log in
                  </Button>
                  <Button
                    color="inherit"
                    component={Link}
                    to="/signup"
                    variant="outlined"
                    sx={{ borderColor: "primary.contrastText", color: "primary.contrastText" }}
                  >
                    Sign up
                  </Button>
                </>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>

      {currentUser && (
        <CreateClassModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onClassCreated={() => {
            window.dispatchEvent(new CustomEvent("classCreated"));
          }}
        />
      )}
    </>
  );
}
