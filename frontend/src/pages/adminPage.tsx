import { useCallback, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import {
  fetchAllUsers,
  fetchClasses,
  fetchUserClasses,
  assignUserToClass,
  unassignUserFromClass,
  type ApiUser,
  type ApiClass,
} from "../services/api";

interface UserWithClasses {
  user: ApiUser;
  classes: ApiClass[];
}

export default function AdminPage() {
  const [usersWithClasses, setUsersWithClasses] = useState<UserWithClasses[]>([]);
  const [allClasses, setAllClasses] = useState<ApiClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<Record<string, string>>({});
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadData = useCallback(async () => {
    try {
      const [users, classes] = await Promise.all([fetchAllUsers(), fetchClasses()]);
      const nonAdmin = users.filter((u) => u.id !== "admin@markbook.com");
      const withClasses = await Promise.all(
        nonAdmin.map(async (user) => {
          const userClasses = await fetchUserClasses(user.id);
          return { user, classes: userClasses };
        })
      );
      setUsersWithClasses(withClasses);
      setAllClasses(classes);
    } catch {
      setToast({ type: "error", message: "Failed to load data." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAssign = async (userId: string) => {
    const classId = selectedClass[userId];
    if (!classId) return;
    try {
      await assignUserToClass(userId, classId);
      setSelectedClass((prev) => ({ ...prev, [userId]: "" }));
      await loadData();
      setToast({ type: "success", message: "Class assigned." });
    } catch (err) {
      setToast({ type: "error", message: err instanceof Error ? err.message : "Failed to assign." });
    }
  };

  const handleUnassign = async (userId: string, classId: string) => {
    try {
      await unassignUserFromClass(userId, classId);
      await loadData();
      setToast({ type: "success", message: "Class removed." });
    } catch {
      setToast({ type: "error", message: "Failed to remove class." });
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={360} sx={{ mb: 6 }} />
        <Skeleton variant="rounded" height={140} sx={{ mb: 4 }} />
        <Skeleton variant="rounded" height={140} />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
        Admin
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 8 }}>
        Assign classes to users so they can access them.
      </Typography>

      {usersWithClasses.length === 0 ? (
        <Box
          sx={{
            py: 12,
            textAlign: "center",
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1 }}>
            No registered users yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Users will appear here as they sign up.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {usersWithClasses.map(({ user, classes: userClasses }) => {
            const unassignedClasses = allClasses.filter(
              (c) => !userClasses.some((uc) => uc.id === c.id),
            );

            return (
              <Card key={user.id} sx={{ p: 5 }}>
                <Box sx={{ mb: 4 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ fontWeight: 600, mb: 0.5 }}
                  >
                    {user.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {user.email}
                  </Typography>
                </Box>

                <Divider sx={{ mb: 4 }} />

                <Typography variant="overline" color="text.disabled" sx={{ display: "block", mb: 2 }}>
                  Assigned Classes
                </Typography>
                <Box
                  sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mb: 4 }}
                >
                  {userClasses.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                      No classes assigned.
                    </Typography>
                  ) : (
                    userClasses.map((cls) => (
                      <Chip
                        key={cls.id}
                        label={`${cls.classLevel} · ${cls.dayOfWeek}`}
                        onDelete={() => handleUnassign(user.id, cls.id)}
                        variant="outlined"
                        size="small"
                      />
                    ))
                  )}
                </Box>

                {unassignedClasses.length > 0 && (
                  <Box
                    sx={{
                      display: "flex",
                      gap: 2,
                      alignItems: "center",
                      flexWrap: "wrap",
                    }}
                  >
                    <FormControl size="small" sx={{ minWidth: 240 }}>
                      <InputLabel>Add class</InputLabel>
                      <Select
                        label="Add class"
                        value={selectedClass[user.id] ?? ""}
                        onChange={(e) =>
                          setSelectedClass((prev) => ({
                            ...prev,
                            [user.id]: e.target.value,
                          }))
                        }
                      >
                        {unassignedClasses.map((cls) => (
                          <MenuItem key={cls.id} value={cls.id}>
                            {cls.classLevel} · {cls.dayOfWeek} {cls.startTime}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                    <Button
                      variant="contained"
                      size="small"
                      disabled={!selectedClass[user.id]}
                      onClick={() => handleAssign(user.id)}
                    >
                      Assign
                    </Button>
                  </Box>
                )}
              </Card>
            );
          })}
        </Box>
      )}

      <Snackbar
        open={toast !== null}
        autoHideDuration={3500}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          onClose={() => setToast(null)}
          severity={toast?.type ?? "success"}
          variant="filled"
        >
          {toast?.message ?? ""}
        </Alert>
      </Snackbar>
    </Container>
  );
}
