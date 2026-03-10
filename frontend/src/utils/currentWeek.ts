import type { TermPeriod } from "../pages/classPage/termData";

const MONTHS: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

/**
 * Parse a dateRange string like "17 Mar – 21 Mar" or "27 Jan – 2 Feb"
 * into { startMonth, startDay, endMonth, endDay }.
 */
function parseDateRange(dateRange: string) {
  // Split on dash/en-dash/em-dash
  const parts = dateRange.trim().split(/\s*[–—-]\s*/);
  if (parts.length !== 2) return null;

  const leftTokens = parts[0].trim().split(/\s+/);
  const rightTokens = parts[1].trim().split(/\s+/);

  // Try "DD Mon" format (day first) and "Mon DD" format (month first)
  const parseToken = (tokens: string[]): { month: number; day: number } | null => {
    if (tokens.length !== 2) return null;
    // Try DD Mon
    const dayFirst = parseInt(tokens[0], 10);
    if (!isNaN(dayFirst) && MONTHS[tokens[1]] !== undefined) {
      return { day: dayFirst, month: MONTHS[tokens[1]] };
    }
    // Try Mon DD
    if (MONTHS[tokens[0]] !== undefined) {
      const day = parseInt(tokens[1], 10);
      if (!isNaN(day)) return { day, month: MONTHS[tokens[0]] };
    }
    return null;
  };

  const left = parseToken(leftTokens);
  if (!left) return null;

  const right = parseToken(rightTokens);
  if (!right) return null;

  return {
    startMonth: left.month,
    startDay: left.day,
    endMonth: right.month,
    endDay: right.day,
  };
}

/**
 * Given the list of terms, find the term key and week index that contains
 * today's date. If today is a weekend, round down to the nearest Friday.
 * Returns the closest week if today doesn't fall within any defined week.
 */
export function findCurrentWeek(
  terms: TermPeriod[],
  today: Date = new Date()
): { termKey: string; weekIndex: number } | null {
  // If weekend (0=Sun, 6=Sat), round down to Friday
  const day = today.getDay();
  const adjusted = new Date(today);
  if (day === 0) {
    adjusted.setDate(adjusted.getDate() - 2);
  } else if (day === 6) {
    adjusted.setDate(adjusted.getDate() - 1);
  }

  const year = adjusted.getFullYear();

  // Build a flat list of all weeks with their resolved dates
  const allWeeks: {
    termKey: string;
    weekIndex: number;
    start: Date;
    end: Date;
  }[] = [];

  let inferredYear = year;
  let prevMonth = -1;

  for (const term of terms) {
    for (let i = 0; i < term.weeks.length; i++) {
      const parsed = parseDateRange(term.weeks[i].dateRange);
      if (!parsed) continue;

      // Handle year rollover (e.g., Dec -> Jan)
      if (parsed.startMonth < prevMonth && prevMonth >= 10 && parsed.startMonth <= 1) {
        inferredYear = year + 1;
      }
      prevMonth = parsed.startMonth;

      const start = new Date(inferredYear, parsed.startMonth, parsed.startDay);
      let endYear = inferredYear;
      if (parsed.endMonth < parsed.startMonth) {
        endYear = inferredYear + 1;
      }
      const end = new Date(endYear, parsed.endMonth, parsed.endDay);

      allWeeks.push({ termKey: term.key, weekIndex: i + 1, start, end });
    }
  }

  if (allWeeks.length === 0) return null;

  // Find exact match
  for (const w of allWeeks) {
    if (adjusted >= w.start && adjusted <= w.end) {
      return { termKey: w.termKey, weekIndex: w.weekIndex };
    }
  }

  // No exact match — return closest week
  let closest = allWeeks[0];
  let closestDist = Infinity;
  for (const w of allWeeks) {
    const mid = (w.start.getTime() + w.end.getTime()) / 2;
    const dist = Math.abs(adjusted.getTime() - mid);
    if (dist < closestDist) {
      closestDist = dist;
      closest = w;
    }
  }

  return { termKey: closest.termKey, weekIndex: closest.weekIndex };
}
