import FormControl from "@mui/material/FormControl";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { TERMS } from "../pages/classPage/termData";

interface TermSelectorProps {
  selectedTermKey: string;
  onTermChange: (key: string) => void;
}

export default function TermSelector({ selectedTermKey, onTermChange }: TermSelectorProps) {
  return (
    <FormControl size="small" sx={{ minWidth: 180, mb: 2 }}>
      <Select
        value={selectedTermKey}
        onChange={(e) => onTermChange(e.target.value)}
      >
        {TERMS.map((t) => (
          <MenuItem key={t.key} value={t.key}>
            {t.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
