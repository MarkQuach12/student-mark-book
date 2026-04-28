import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import type { TermPeriod } from "../pages/classPage/termData";

interface WeekTabsProps {
  terms: TermPeriod[];
  selectedTermKey: string;
  selectedWeekIndex: number;
  onWeekChange: (weekIndex: number) => void;
}

export default function WeekTabs({
  terms,
  selectedTermKey,
  selectedWeekIndex,
  onWeekChange,
}: WeekTabsProps) {
  const term = terms.find((t) => t.key === selectedTermKey);
  if (!term) return null;
  return (
    <Tabs
      value={selectedWeekIndex - 1}
      onChange={(_, value) => onWeekChange((value as number) + 1)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{
        borderBottom: 1,
        borderColor: "divider",
        mb: 4,
        minHeight: 36,
        "& .MuiTab-root": { minHeight: 36, py: 1, fontSize: "0.8125rem" },
      }}
    >
      {term.weeks.map((week, i) => (
        <Tab key={i} label={week.label} value={i} />
      ))}
    </Tabs>
  );
}
