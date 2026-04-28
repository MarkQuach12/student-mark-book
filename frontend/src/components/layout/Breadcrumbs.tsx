import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { fetchClasses } from "../../services/api";
import type { ClassData } from "../../pages/classPage/types";

function Crumb({
  label,
  to,
  last,
}: {
  label: string;
  to?: string;
  last: boolean;
}) {
  if (last || !to)
    return (
      <Typography
        variant="body2"
        color="text.primary"
        sx={{ fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
      >
        {label}
      </Typography>
    );
  return (
    <Typography
      component={Link}
      to={to}
      variant="body2"
      sx={{
        color: "text.secondary",
        textDecoration: "none",
        "&:hover": { color: "text.primary" },
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </Typography>
  );
}

function Separator() {
  return (
    <Typography
      component="span"
      variant="body2"
      color="text.disabled"
      sx={{ mx: 1.5 }}
    >
      /
    </Typography>
  );
}

export default function Breadcrumbs() {
  const location = useLocation();
  const params = useParams<{ id?: string }>();
  const [classes, setClasses] = useState<ClassData[]>([]);

  useEffect(() => {
    if (location.pathname.startsWith("/classOverview/")) {
      fetchClasses()
        .then(setClasses)
        .catch(() => {});
    }
  }, [location.pathname]);

  let crumbs: { label: string; to?: string }[] = [];
  if (location.pathname === "/") crumbs = [{ label: "Home" }];
  else if (location.pathname.startsWith("/admin"))
    crumbs = [{ label: "Admin" }];
  else if (location.pathname.startsWith("/settings"))
    crumbs = [{ label: "Settings" }];
  else if (location.pathname.startsWith("/classOverview/")) {
    const cls = classes.find((c) => c.id === params.id);
    crumbs = [
      { label: "Classes", to: "/" },
      { label: cls?.classLevel ?? "…" },
    ];
  } else crumbs = [{ label: "" }];

  return (
    <Box sx={{ display: "flex", alignItems: "center", minWidth: 0 }}>
      {crumbs.map((c, i) => (
        <Box
          key={i}
          sx={{ display: "flex", alignItems: "center", minWidth: 0 }}
        >
          {i > 0 && <Separator />}
          <Crumb label={c.label} to={c.to} last={i === crumbs.length - 1} />
        </Box>
      ))}
    </Box>
  );
}
