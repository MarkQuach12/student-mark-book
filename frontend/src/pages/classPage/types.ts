export interface Student {
  id: string;
  name: string;
}

export interface Homework {
  id: string;
  title: string;
  week: number; // 1–10
}

export interface CompletionRecord {
  studentId: string;
  homeworkId: string;
  completed: boolean;
}

export interface ClassData {
  id: string;
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  name: string; // computed display name
  students: Student[];
  homework: Homework[];
}

export type CompletionMap = Record<string, boolean>; // key: `${studentId}-${homeworkId}`
