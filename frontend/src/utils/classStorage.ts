import type { ClassData } from "../pages/classPage/types";

const CLASSES_KEY = "classes";

export function getClasses(): ClassData[] {
  try {
    const raw = localStorage.getItem(CLASSES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getClassById(id: string): ClassData | null {
  const classes = getClasses();
  return classes.find((c) => c.id === id) ?? null;
}

export function saveClass(classData: ClassData): void {
  const classes = getClasses();
  const index = classes.findIndex((c) => c.id === classData.id);
  if (index >= 0) {
    classes[index] = classData;
  } else {
    classes.push(classData);
  }
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

export function deleteClass(id: string): void {
  const classes = getClasses().filter((c) => c.id !== id);
  localStorage.setItem(CLASSES_KEY, JSON.stringify(classes));
}

