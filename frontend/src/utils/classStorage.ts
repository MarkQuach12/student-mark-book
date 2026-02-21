import type { ClassData } from "../pages/classPage/types";
import { STORAGE_KEYS } from "./constants";
import { getArrayFromStorage, setInStorage } from "./storageUtils";

export function getClasses(): ClassData[] {
  return getArrayFromStorage<ClassData>(STORAGE_KEYS.CLASSES);
}

export function getClassById(id: string): ClassData | null {
  return getClasses().find((c) => c.id === id) ?? null;
}

export function saveClass(classData: ClassData): void {
  const classes = getClasses();
  const index = classes.findIndex((c) => c.id === classData.id);
  if (index >= 0) {
    classes[index] = classData;
  } else {
    classes.push(classData);
  }
  setInStorage(STORAGE_KEYS.CLASSES, classes);
}

export function deleteClass(id: string): void {
  setInStorage(STORAGE_KEYS.CLASSES, getClasses().filter((c) => c.id !== id));
}
