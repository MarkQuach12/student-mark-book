const AUTH_USERS_KEY = "auth_users";
const AUTH_USER_KEY = "auth_user";

export interface StoredUser {
  name: string;
  email: string;
  password: string;
}

export interface CurrentUser {
  name: string;
  email: string;
}

export function getUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(AUTH_USERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function addUser(user: StoredUser): void {
  const users = getUsers();
  users.push(user);
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

export function getCurrentUser(): CurrentUser | null {
  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CurrentUser;
    return parsed?.name != null && parsed?.email != null ? parsed : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: CurrentUser): void {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function clearCurrentUser(): void {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function findUserByEmail(email: string): StoredUser | undefined {
  return getUsers().find((u) => u.email.toLowerCase() === email.toLowerCase());
}
