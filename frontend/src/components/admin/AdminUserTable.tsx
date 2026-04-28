import { useMemo } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import type { ApiClass, ApiUser } from "../../services/api";

export interface UserRow {
  user: ApiUser;
  classes: ApiClass[];
}

interface AdminUserTableProps {
  rows: UserRow[];
  searchQuery: string;
  onOpenUser: (user: ApiUser) => void;
}

const MAX_PREVIEW_CHIPS = 2;

function classChipLabel(cls: ApiClass) {
  return `${cls.classLevel} · ${cls.dayOfWeek}`;
}

export default function AdminUserTable({
  rows,
  searchQuery,
  onOpenUser,
}: AdminUserTableProps) {
  const visibleRows = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.user.name.toLowerCase().includes(q) ||
        r.user.email.toLowerCase().includes(q),
    );
  }, [rows, searchQuery]);

  if (visibleRows.length === 0) {
    return (
      <Box
        sx={{
          py: 8,
          textAlign: "center",
          border: 1,
          borderColor: "divider",
          borderRadius: 2,
        }}
      >
        <Typography variant="subtitle1" sx={{ mb: 1 }}>
          {rows.length === 0 ? "No registered users yet" : "No users match your search"}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {rows.length === 0
            ? "Users will appear here as they sign up."
            : "Try a different name or email."}
        </Typography>
      </Box>
    );
  }

  return (
    <Card sx={{ overflow: "auto", p: 0 }}>
      <Table size="small" stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell sx={{ fontWeight: 500 }}>Name</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>Email</TableCell>
            <TableCell sx={{ fontWeight: 500 }}>Classes</TableCell>
            <TableCell sx={{ width: "1px" }} />
          </TableRow>
        </TableHead>
        <TableBody>
          {visibleRows.map(({ user, classes }) => {
            const preview = classes.slice(0, MAX_PREVIEW_CHIPS);
            const overflow = classes.length - preview.length;
            return (
              <TableRow
                key={user.id}
                hover
                onClick={() => onOpenUser(user)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{user.name}</TableCell>
                <TableCell
                  sx={{
                    fontFamily: "'JetBrains Mono', monospace",
                    color: "text.secondary",
                    fontSize: "0.8125rem",
                  }}
                >
                  {user.email}
                </TableCell>
                <TableCell>
                  {classes.length === 0 ? (
                    <Typography variant="body2" color="text.disabled">
                      None
                    </Typography>
                  ) : (
                    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
                      {preview.map((cls) => (
                        <Chip
                          key={cls.id}
                          label={classChipLabel(cls)}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                      {overflow > 0 && (
                        <Chip
                          label={`+${overflow}`}
                          size="small"
                          variant="outlined"
                          sx={{ color: "text.secondary" }}
                        />
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell padding="none" sx={{ pr: 1 }}>
                  <IconButton
                    size="small"
                    aria-label={`Manage ${user.name}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenUser(user);
                    }}
                  >
                    <ChevronRightIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Card>
  );
}
