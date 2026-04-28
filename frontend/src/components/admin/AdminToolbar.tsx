import Box from "@mui/material/Box";
import InputAdornment from "@mui/material/InputAdornment";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";

interface AdminToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export default function AdminToolbar({ search, onSearchChange }: AdminToolbarProps) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap", mb: 3 }}>
      <TextField
        size="small"
        placeholder="Search by name or email"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flex: 1, minWidth: 240 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: "text.disabled" }} />
            </InputAdornment>
          ),
        }}
      />
    </Box>
  );
}
