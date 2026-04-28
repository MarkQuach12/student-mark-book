import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import LightModeIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeIcon from "@mui/icons-material/DarkModeOutlined";
import { useThemeMode } from "../../contexts/ThemeContext";

export default function ThemeToggle() {
  const { resolvedMode, toggleMode } = useThemeMode();
  const next = resolvedMode === "dark" ? "light" : "dark";
  return (
    <Tooltip title={`Switch to ${next} mode`}>
      <IconButton size="small" onClick={toggleMode} aria-label="Toggle theme">
        {resolvedMode === "dark" ? (
          <LightModeIcon sx={{ fontSize: 18 }} />
        ) : (
          <DarkModeIcon sx={{ fontSize: 18 }} />
        )}
      </IconButton>
    </Tooltip>
  );
}
