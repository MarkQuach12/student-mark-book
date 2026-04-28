import { useCallback, useEffect, useMemo, useState } from "react";
import Alert from "@mui/material/Alert";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import Snackbar from "@mui/material/Snackbar";
import Typography from "@mui/material/Typography";
import {
  assignUserToClass,
  fetchAllUsers,
  fetchClasses,
  fetchUserClasses,
  unassignUserFromClass,
  type ApiClass,
  type ApiUser,
} from "../services/api";
import AdminToolbar from "../components/admin/AdminToolbar";
import AdminUserTable from "../components/admin/AdminUserTable";
import type { UserRow } from "../components/admin/AdminUserTable";
import UserDetailDrawer from "../components/admin/UserDetailDrawer";

type Toast = { type: "success" | "error"; message: string };

function classYear(cls: ApiClass): number {
  const match = cls.classLevel.match(/\d+/);
  return match ? parseInt(match[0], 10) : -1;
}

function maxYear(classes: ApiClass[]): number {
  if (classes.length === 0) return -1;
  return classes.reduce((acc, c) => Math.max(acc, classYear(c)), -1);
}

export default function AdminPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [allClasses, setAllClasses] = useState<ApiClass[]>([]);
  const [classesByUserId, setClassesByUserId] = useState<Map<string, ApiClass[]>>(
    new Map(),
  );
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<Toast | null>(null);

  const [search, setSearch] = useState("");
  const [drawerUser, setDrawerUser] = useState<ApiUser | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [fetchedUsers, fetchedClasses] = await Promise.all([
          fetchAllUsers(),
          fetchClasses(),
        ]);
        const perUser = await Promise.all(
          fetchedUsers.map((u) => fetchUserClasses(u.id)),
        );
        if (cancelled) return;
        const map = new Map<string, ApiClass[]>();
        fetchedUsers.forEach((u, i) => map.set(u.id, perUser[i]));
        setUsers(fetchedUsers);
        setAllClasses(fetchedClasses);
        setClassesByUserId(map);
      } catch {
        if (!cancelled) setToast({ type: "error", message: "Failed to load data." });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateUserClasses = useCallback(
    (userId: string, updater: (prev: ApiClass[]) => ApiClass[]) => {
      setClassesByUserId((prev) => {
        const next = new Map(prev);
        next.set(userId, updater(prev.get(userId) ?? []));
        return next;
      });
    },
    [],
  );

  const handleAssign = useCallback(
    async (userId: string, classId: string) => {
      const cls = allClasses.find((c) => c.id === classId);
      if (!cls) return;
      try {
        await assignUserToClass(userId, classId);
        updateUserClasses(userId, (prev) =>
          prev.some((c) => c.id === classId) ? prev : [...prev, cls],
        );
        setToast({ type: "success", message: "Class assigned." });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to assign class.";
        setToast({ type: "error", message });
      }
    },
    [allClasses, updateUserClasses],
  );

  const handleUnassign = useCallback(
    async (userId: string, classId: string) => {
      try {
        await unassignUserFromClass(userId, classId);
        updateUserClasses(userId, (prev) => prev.filter((c) => c.id !== classId));
        setToast({ type: "success", message: "Class removed." });
      } catch {
        setToast({ type: "error", message: "Failed to remove class." });
      }
    },
    [updateUserClasses],
  );

  const rows: UserRow[] = useMemo(() => {
    const built = users.map((user) => ({
      user,
      classes: classesByUserId.get(user.id) ?? [],
    }));
    built.sort((a, b) => {
      const ya = maxYear(a.classes);
      const yb = maxYear(b.classes);
      if (yb !== ya) return yb - ya;
      return a.user.name.localeCompare(b.user.name);
    });
    return built;
  }, [users, classesByUserId]);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
        <Skeleton variant="text" width={240} height={40} sx={{ mb: 1 }} />
        <Skeleton variant="text" width={360} sx={{ mb: 6 }} />
        <Skeleton variant="rounded" height={48} sx={{ mb: 3 }} />
        <Skeleton variant="rounded" height={320} />
      </Container>
    );
  }

  const drawerClasses = drawerUser
    ? classesByUserId.get(drawerUser.id) ?? []
    : [];

  return (
    <Container maxWidth="lg" sx={{ pt: 6, pb: 8 }}>
      <Typography variant="h1" component="h1" sx={{ mb: 1 }}>
        Admin
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
        Search users and manage their class access.
      </Typography>

      <AdminToolbar search={search} onSearchChange={setSearch} />

      <AdminUserTable
        rows={rows}
        searchQuery={search}
        onOpenUser={setDrawerUser}
      />

      <UserDetailDrawer
        open={drawerUser !== null}
        user={drawerUser}
        allClasses={allClasses}
        userClasses={drawerClasses}
        onAssign={(classId) =>
          drawerUser ? handleAssign(drawerUser.id, classId) : undefined
        }
        onUnassign={(classId) =>
          drawerUser ? handleUnassign(drawerUser.id, classId) : undefined
        }
        onClose={() => setDrawerUser(null)}
      />

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
