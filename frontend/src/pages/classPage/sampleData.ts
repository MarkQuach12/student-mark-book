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
  { id: "hw1",  title: "Homework 1",  termKey: "term1", weekIndex: 1 },
  { id: "hw2",  title: "Worksheet 1", termKey: "term1", weekIndex: 1 },
  { id: "hw3",  title: "Practice 1",  termKey: "term1", weekIndex: 1 },
  { id: "hw4",  title: "Homework 2",  termKey: "term1", weekIndex: 2 },
  { id: "hw5",  title: "Worksheet 2", termKey: "term1", weekIndex: 2 },
  { id: "hw6",  title: "Practice 2",  termKey: "term1", weekIndex: 2 },
  { id: "hw7",  title: "Homework 3",  termKey: "term1", weekIndex: 3 },
  { id: "hw8",  title: "Worksheet 3", termKey: "term1", weekIndex: 3 },
  { id: "hw9",  title: "Practice 3",  termKey: "term1", weekIndex: 3 },
  { id: "hw10", title: "Homework 4",  termKey: "term1", weekIndex: 4 },
  { id: "hw11", title: "Worksheet 4", termKey: "term1", weekIndex: 4 },
  { id: "hw12", title: "Practice 4",  termKey: "term1", weekIndex: 4 },
  { id: "hw13", title: "Homework 5",  termKey: "term1", weekIndex: 5 },
  { id: "hw14", title: "Worksheet 5", termKey: "term1", weekIndex: 5 },
  { id: "hw15", title: "Practice 5",  termKey: "term1", weekIndex: 5 },
  { id: "hw16", title: "Homework 6",  termKey: "term1", weekIndex: 6 },
  { id: "hw17", title: "Worksheet 6", termKey: "term1", weekIndex: 6 },
  { id: "hw18", title: "Practice 6",  termKey: "term1", weekIndex: 6 },
  { id: "hw19", title: "Homework 7",  termKey: "term1", weekIndex: 7 },
  { id: "hw20", title: "Worksheet 7", termKey: "term1", weekIndex: 7 },
  { id: "hw21", title: "Practice 7",  termKey: "term1", weekIndex: 7 },
  { id: "hw22", title: "Homework 8",  termKey: "term1", weekIndex: 8 },
  { id: "hw23", title: "Worksheet 8", termKey: "term1", weekIndex: 8 },
  { id: "hw24", title: "Practice 8",  termKey: "term1", weekIndex: 8 },
  { id: "hw25", title: "Homework 9",  termKey: "term1", weekIndex: 9 },
  { id: "hw26", title: "Worksheet 9", termKey: "term1", weekIndex: 9 },
  { id: "hw27", title: "Practice 9",  termKey: "term1", weekIndex: 9 },
  { id: "hw28", title: "Homework 1",  termKey: "term2", weekIndex: 1 },
  { id: "hw29", title: "Worksheet 1", termKey: "term2", weekIndex: 1 },
  { id: "hw30", title: "Practice 1",  termKey: "term2", weekIndex: 1 },
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
  classLevel: "Y11 Standard",
  dayOfWeek: "Monday",
  startTime: "9:00",
  endTime: "10:30",
  name: "Y11 Standard - Monday 9:00-10:30",
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

export const getHomeworkForWeek = (homework: Homework[], termKey: string, weekIndex: number): Homework[] => {
  return homework.filter((h) => h.termKey === termKey && h.weekIndex === weekIndex);
};
