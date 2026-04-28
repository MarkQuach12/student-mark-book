import { useMemo, useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import type { ApiClass, ApiUser } from "../../services/api";

interface UserDetailDrawerProps {
  open: boolean;
  user: ApiUser | null;
  allClasses: ApiClass[];
  userClasses: ApiClass[];
  onAssign: (classId: string) => Promise<void> | void;
  onUnassign: (classId: string) => Promise<void> | void;
  onClose: () => void;
}

export default function UserDetailDrawer({
  open,
  user,
  allClasses,
  userClasses,
  onAssign,
  onUnassign,
  onClose,
}: UserDetailDrawerProps) {
  const [pending, setPending] = useState<string | null>(null);
  const [picked, setPicked] = useState<ApiClass | null>(null);

  const unassignedClasses = useMemo(() => {
    const assigned = new Set(userClasses.map((c) => c.id));
    return allClasses.filter((c) => !assigned.has(c.id));
  }, [allClasses, userClasses]);

  const handleAdd = async () => {
    if (!picked) return;
    setPending(picked.id);
    try {
      await onAssign(picked.id);
      setPicked(null);
    } finally {
      setPending(null);
    }
  };

  const handleRemove = async (classId: string) => {
    setPending(classId);
    try {
      await onUnassign(classId);
    } finally {
      setPending(null);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{ sx: { width: { xs: "100%", sm: 420 } } }}
    >
      <Box sx={{ p: 4, display: "flex", flexDirection: "column", height: "100%" }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }} noWrap>
              {user?.name ?? ""}
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontFamily: "'JetBrains Mono', monospace" }}
              noWrap
            >
              {user?.email ?? ""}
            </Typography>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Close">
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Divider sx={{ mb: 3 }} />

        <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
          Assigned Classes
        </Typography>

        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 4 }}>
          {userClasses.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No classes assigned.
            </Typography>
          ) : (
            userClasses.map((cls) => (
              <Chip
                key={cls.id}
                label={`${cls.classLevel} · ${cls.dayOfWeek}`}
                onDelete={pending === cls.id ? undefined : () => handleRemove(cls.id)}
                disabled={pending === cls.id}
                variant="outlined"
                size="small"
              />
            ))
          )}
        </Box>

        <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 1.5 }}>
          Add a Class
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
          <Autocomplete
            sx={{ flex: 1 }}
            size="small"
            options={unassignedClasses}
            value={picked}
            onChange={(_e, value) => setPicked(value)}
            getOptionLabel={(opt) =>
              `${opt.classLevel} · ${opt.dayOfWeek} ${opt.startTime}`
            }
            isOptionEqualToValue={(a, b) => a.id === b.id}
            disabled={unassignedClasses.length === 0}
            renderInput={(params) => (
              <TextField
                {...params}
                placeholder={
                  unassignedClasses.length === 0
                    ? "Already in every class"
                    : "Pick a class"
                }
              />
            )}
          />
          <Button
            variant="contained"
            size="small"
            disabled={!picked || pending !== null}
            onClick={handleAdd}
            sx={{ alignSelf: "stretch" }}
          >
            Add
          </Button>
        </Box>
      </Box>
    </Drawer>
  );
}
