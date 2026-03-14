export const DAY_COLUMNS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

/** Convert "HH:mm:ss" or "HH:mm" to minutes since midnight. */
export function parseTime(timeStr: string): number {
  const parts = timeStr.split(":");
  return parseInt(parts[0], 10) * 60 + parseInt(parts[1], 10);
}

/** Format an hour number to a label like "9 am", "12 pm", "3 pm". */
export function formatTimeLabel(hour: number): string {
  if (hour === 0) return "12 am";
  if (hour < 12) return `${hour} am`;
  if (hour === 12) return "12 pm";
  return `${hour - 12} pm`;
}

/** Return today's day name (e.g. "Monday") matching DAY_COLUMNS. */
export function getTodayName(): string {
  return new Date().toLocaleDateString("en-US", { weekday: "long" });
}

/** Format minutes since midnight to "HH:MM" display. */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

// ── Date-aware helpers (for week navigation) ────────────────────────

const SHORT_MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const SHORT_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/** Return the Monday of the week containing the given date. */
export function getMonday(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun, 1=Mon, ...
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Return 7 Date objects (Mon–Sun) starting from the given Monday. */
export function getWeekDates(monday: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

/** Format a date as "Mon 17 Mar". */
export function formatDayHeader(date: Date): string {
  const dayName = SHORT_DAYS[((date.getDay() + 6) % 7)]; // Mon=0
  return `${dayName} ${date.getDate()} ${SHORT_MONTHS[date.getMonth()]}`;
}

/** Format a date as "YYYY-MM-DD" using local date (no UTC shift). */
export function formatDateISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Check if two dates represent the same calendar day. */
export function isSameDate(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();
}
