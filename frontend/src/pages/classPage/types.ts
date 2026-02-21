export interface Student {
  id: string;
  name: string;
}

export interface Homework {
  id: string;
  title: string;
  termKey: string;   // e.g. "term1", "term1Holiday", "term2", ...
  weekIndex: number; // 1-based index within that term's week list
}

export interface CompletionRecord {
  studentId: string;
  homeworkId: string;
  completed: boolean;
}

export type PaymentStatus = "unpaid" | "paid_cash" | "paid_online";

export interface ClassData {
  id: string;
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  name: string; // computed display name
  students: Student[];
  homework: Homework[];
  payments?: Record<string, PaymentStatus>; // key: `${studentId}-${termKey}-${weekIndex}`
}

export type CompletionMap = Record<string, boolean>; // key: `${studentId}-${homeworkId}`
