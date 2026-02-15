import { useCallback, useState } from "react";
import type { ClassData, CompletionMap, Homework, Student } from "./types";

// --- Fixed sample data (no random generation) ---

const SAMPLE_STUDENTS: Student[] = [
  { id: "s1", name: "Alice Smith" },
  { id: "s2", name: "Bob Jones" },
  { id: "s3", name: "Charlie Brown" },
  { id: "s4", name: "Diana Prince" },
  { id: "s5", name: "Eve Wilson" },
];

const SAMPLE_HOMEWORK: Homework[] = [
  { id: "hw1", title: "Algebra – Linear Equations", week: 1 },
  { id: "hw2", title: "Algebra – Quadratic Expressions", week: 2 },
  { id: "hw3", title: "Geometry – Angles and Triangles", week: 3 },
  { id: "hw4", title: "Geometry – Area and Perimeter", week: 4 },
  { id: "hw5", title: "Statistics – Mean and Median", week: 5 },
  { id: "hw6", title: "Statistics – Charts and Graphs", week: 6 },
  { id: "hw7", title: "Algebra – Simultaneous Equations", week: 7 },
  { id: "hw8", title: "Algebra – Inequalities", week: 8 },
  { id: "hw9", title: "Geometry – Pythagoras", week: 9 },
  { id: "hw10", title: "Revision – Mixed topics", week: 10 },
];

// Keys for which homework is completed: "studentId-homeworkId". Everything else starts as incomplete.
const INITIAL_COMPLETED_KEYS: string[] = [
  "s1-hw1", "s1-hw2", "s1-hw3", "s2-hw1", "s2-hw2", "s3-hw1", "s3-hw3", "s4-hw1", "s4-hw4", "s5-hw1", "s5-hw2", "s5-hw3",
];

// --- Helpers ---

const buildCompletionMap = (
  students: Student[],
  homework: Homework[],
  completedKeys: string[]
): CompletionMap => {
  const set = new Set(completedKeys);
  const map: CompletionMap = {};
  for (const s of students) {
    for (const h of homework) {
      map[`${s.id}-${h.id}`] = set.has(`${s.id}-${h.id}`);
    }
  }
  return map;
};

const SAMPLE_CLASS: ClassData = {
  id: "1",
  name: "Year 10 Mathematics",
  students: SAMPLE_STUDENTS,
  homework: SAMPLE_HOMEWORK,
};

const INITIAL_COMPLETIONS = buildCompletionMap(
  SAMPLE_STUDENTS,
  SAMPLE_HOMEWORK,
  INITIAL_COMPLETED_KEYS
);

// --- Hook (same for any classId – one fixed sample class) ---

export const useSampleData = (classId: string): {
  classData: ClassData;
  completions: CompletionMap;
  setCompletion: (studentId: string, homeworkId: string, completed: boolean) => void;
} => {
  const classData: ClassData = { ...SAMPLE_CLASS, id: classId };
  const [completions, setCompletions] = useState<CompletionMap>(() => ({ ...INITIAL_COMPLETIONS }));

  const setCompletion = useCallback(
    (studentId: string, homeworkId: string, completed: boolean) => {
      const key = `${studentId}-${homeworkId}`;
      setCompletions((prev) => ({ ...prev, [key]: completed }));
    },
    []
  );

  return {
    classData,
    completions,
    setCompletion,
  };
};

export const getHomeworkByWeek = (homework: Homework[], week: number): Homework[] => {
  return homework.filter((h) => h.week === week);
};
