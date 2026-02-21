import type { CurrentUser, StoredUser } from "../types/auth";
import { STORAGE_KEYS } from "./constants";
import { getArrayFromStorage, getSingleFromStorage, removeFromStorage, setInStorage } from "./storageUtils";

export type { StoredUser, CurrentUser };

export function getUsers(): StoredUser[] {
  return getArrayFromStorage<StoredUser>(STORAGE_KEYS.USERS);
}

export function addUser(user: StoredUser): void {
  const users = getUsers();
  users.push(user);
  setInStorage(STORAGE_KEYS.USERS, users);
}

export function getCurrentUser(): CurrentUser | null {
  const parsed = getSingleFromStorage<CurrentUser>(STORAGE_KEYS.CURRENT_USER);
  return parsed?.name != null && parsed?.email != null ? parsed : null;
}

export function setCurrentUser(user: CurrentUser): void {
  setInStorage(STORAGE_KEYS.CURRENT_USER, user);
}

export function clearCurrentUser(): void {
  removeFromStorage(STORAGE_KEYS.CURRENT_USER);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
