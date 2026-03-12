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

/** Format minutes since midnight to "HH:MM" display. */
export function formatMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}
