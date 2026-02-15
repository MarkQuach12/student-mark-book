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
  name: string;
  students: Student[];
  homework: Homework[];
}

export type CompletionMap = Record<string, boolean>; // key: `${studentId}-${homeworkId}`
