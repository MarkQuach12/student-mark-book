import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import type { TermPeriod } from "../pages/classPage/termData";

interface TermSelectorProps {
  terms: TermPeriod[];
  selectedTermKey: string;
  onTermChange: (key: string) => void;
}

export default function TermSelector({
  terms,
  selectedTermKey,
  onTermChange,
}: TermSelectorProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 200, mb: 4 }}>
      <Select
        value={selectedTermKey}
        onChange={(e) => onTermChange(e.target.value)}
      >
        {terms.map((t) => (
          <MenuItem key={t.key} value={t.key}>
            {t.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
