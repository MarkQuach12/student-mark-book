export interface WeekInfo {
  label: string;
  dateRange: string;
}

export interface TermPeriod {
  key: string;
  label: string;
  weeks: WeekInfo[];
}
