import { useEffect, useState, type ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import HomeIcon from "@mui/icons-material/HomeOutlined";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AddIcon from "@mui/icons-material/Add";
import SchoolIcon from "@mui/icons-material/SchoolOutlined";
import { Link, useLocation, useParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { fetchClasses } from "../../services/api";
import type { ClassData } from "../../pages/classPage/types";
import CreateClassModal from "../CreateClassModal";

interface SidebarItemProps {
  to: string;
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarItem({ to, icon, label, active, onClick }: SidebarItemProps) {
  return (
    <Box
      component={Link}
      to={to}
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 2,
        px: 2,
        py: 1.5,
        borderRadius: 1.5,
        textDecoration: "none",
        color: active ? "primary.main" : "text.primary",
        bgcolor: active
          ? (t) =>
              t.palette.mode === "dark"
                ? "rgba(59,111,160,0.10)"
                : "#EEF2F7"
          : "transparent",
        fontSize: "0.875rem",
        fontWeight: active ? 500 : 400,
        "&:hover": {
          bgcolor: active
            ? (t) =>
                t.palette.mode === "dark"
                  ? "rgba(59,111,160,0.15)"
                  : "#E7ECF3"
            : "action.hover",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: "inherit",
          "& svg": { fontSize: 18 },
        }}
      >
        {icon}
      </Box>
      <Box
        sx={{
          overflow: "hidden",
          textOverflow: "ellipsis",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </Box>
    </Box>
  );
}

function SectionHeader({
  children,
  action,
}: {
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        px: 2,
        mt: 4,
        mb: 1,
      }}
    >
      <Typography variant="overline" color="text.disabled">
        {children}
      </Typography>
      {action}
    </Box>
  );
}

interface SidebarProps {
  onNavigate?: () => void;
}

export default function Sidebar({ onNavigate }: SidebarProps) {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const [classes, setClasses] = useState<ClassData[]>([]);
  const [createOpen, setCreateOpen] = useState(false);

  const loadClasses = async () => {
    try {
      const data = await fetchClasses();
      setClasses(data);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    loadClasses();
    const refresh = () => loadClasses();
    window.addEventListener("classCreated", refresh);
    window.addEventListener("classDeleted", refresh);
    return () => {
      window.removeEventListener("classCreated", refresh);
      window.removeEventListener("classDeleted", refresh);
    };
  }, []);

  return (
    <Box
      sx={{
        width: 240,
        flexShrink: 0,
        height: "100vh",
        bgcolor: (t) => (t.palette.mode === "dark" ? "#111114" : "#F9FAFB"),
        borderRight: 1,
        borderColor: "divider",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        px: 1.5,
        py: 3,
      }}
    >
      <Typography
        component={Link}
        to="/"
        onClick={onNavigate}
        sx={{
          px: 2,
          mb: 2,
          fontSize: "0.9375rem",
          fontWeight: 600,
          letterSpacing: "-0.01em",
          color: "text.primary",
          textDecoration: "none",
        }}
      >
        MQ Mark Book
      </Typography>

      <SectionHeader>Workspace</SectionHeader>
      <SidebarItem
        to="/"
        icon={<HomeIcon />}
        label="Home"
        active={location.pathname === "/"}
        onClick={onNavigate}
      />
      {isAdmin && (
        <SidebarItem
          to="/admin"
          icon={<AdminPanelSettingsIcon />}
          label="Admin"
          active={location.pathname.startsWith("/admin")}
          onClick={onNavigate}
        />
      )}

      <SectionHeader
        action={
          isAdmin ? (
            <Tooltip title="Create new class">
              <IconButton
                size="small"
                onClick={() => setCreateOpen(true)}
                sx={{ p: 0.5 }}
              >
                <AddIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          ) : undefined
        }
      >
        Classes
      </SectionHeader>
      {classes.length === 0 && (
        <Typography
          variant="body2"
          color="text.disabled"
          sx={{ px: 2, py: 1 }}
        >
          {isAdmin ? "No classes yet." : "No classes assigned."}
        </Typography>
      )}
      {classes.map((cls) => (
        <SidebarItem
          key={cls.id}
          to={`/classOverview/${cls.id}`}
          icon={<SchoolIcon />}
          label={cls.classLevel}
          active={params.id === cls.id}
          onClick={onNavigate}
        />
      ))}

      {isAdmin && (
        <CreateClassModal
          open={createOpen}
          onClose={() => setCreateOpen(false)}
          onClassCreated={() => {
            window.dispatchEvent(new CustomEvent("classCreated"));
          }}
        />
      )}
    </Box>
  );
}
