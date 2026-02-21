import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import { getTermByKey } from "../pages/classPage/termData";

interface WeekTabsProps {
  selectedTermKey: string;
  selectedWeekIndex: number;
  onWeekChange: (weekIndex: number) => void;
}

export default function WeekTabs({ selectedTermKey, selectedWeekIndex, onWeekChange }: WeekTabsProps) {
  const term = getTermByKey(selectedTermKey);
  if (!term) return null;
  return (
    <Tabs
      value={selectedWeekIndex - 1}
      onChange={(_, value) => onWeekChange((value as number) + 1)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}
    >
      {term.weeks.map((week, i) => (
        <Tab key={i} label={week.label} value={i} />
      ))}
    </Tabs>
  );
}
