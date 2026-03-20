import { getToken, clearAuth } from "../utils/authStorage";
import type { AuthResponse } from "../types/auth";
import type { Student, Homework, PaymentStatus } from "../pages/classPage/types";
import type { TermPeriod } from "../pages/classPage/termData";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

// ── Cache ────────────────────────────────────────────────────────────

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

function getCached<T>(key: string): T | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(prefix: string): void {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}

export function clearAllCache(): void {
  cache.clear();
}

// ── Helpers ────────────────────────────────────────────────────────────

function authHeaders(extra?: Record<string, string>): Record<string, string> {
  const token = getToken();
  const base: Record<string, string> = { "Content-Type": "application/json" };
  if (token) base["Authorization"] = `Bearer ${token}`;
  return { ...base, ...extra };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearAuth();
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try {
      const json = JSON.parse(text);
      if (json.message) message = json.message;
      else if (json.error) message = json.error;
    } catch { /* use raw text */ }
    throw new Error(message);
  }
  return res.json() as Promise<T>;
}

// ── Auth ─────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function signup(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse<AuthResponse>(res);
}

export async function startDemo(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<AuthResponse>(res);
}

export async function startDemoAdmin(): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/auth/demo-admin`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  return handleResponse<AuthResponse>(res);
}

export async function validateResetToken(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/validate-reset-token?token=${encodeURIComponent(token)}`);
  if (!res.ok) throw new Error("Invalid link.");
}

export async function forgotPassword(email: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token, newPassword }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try { const json = JSON.parse(text); if (json.message) message = json.message; } catch { /* raw text */ }
    throw new Error(message);
  }
}

// ── API response types (where they differ from existing frontend types) ──

export interface ApiClass {
  id: string;
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  name: string;
  label?: string;
}

export interface ApiAttendance {
  studentId: string;
  termKey: string;
  weekIndex: number;
  present: boolean;
}

export interface ApiCompletion {
  studentId: string;
  homeworkId: string;
  completed: boolean;
}

export interface ApiPayment {
  studentId: string;
  termKey: string;
  weekIndex: number;
  status: string;
}

// ── Class Overview (aggregate) ────────────────────────────────────────

export interface ApiResource {
  id: string;
  title: string;
  driveFileId: string | null;
  driveUrl: string;
  fileType: string | null;
  sortOrder: number;
}

export interface ApiTopic {
  id: string;
  name: string;
  visible: boolean;
  sortOrder: number;
  resources: ApiResource[];
}

export interface ClassOverviewResponse {
  classInfo: ApiClass;
  students: Student[];
  homework: Homework[];
  attendance: ApiAttendance[];
  completions: ApiCompletion[];
  payments: ApiPayment[];
  terms: TermPeriod[];
  exams: ApiExam[];
  topics: ApiTopic[];
  extraLessons: ApiExtraLesson[];
}

export async function fetchClassOverview(classId: string): Promise<ClassOverviewResponse> {
  const key = `overview:${classId}`;
  const cached = getCached<ClassOverviewResponse>(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/classes/${classId}/overview`, {
    headers: authHeaders(),
  });
  const data = await handleResponse<ClassOverviewResponse>(res);
  setCache(key, data);
  return data;
}

// ── Users ───────────────────────────────────────────────────────────

export interface ApiUser {
  id: string;
  name: string;
  email: string;
}

export async function fetchCurrentUser(): Promise<ApiUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    headers: authHeaders(),
  });
  return handleResponse<ApiUser>(res);
}

export async function updateUserName(name: string): Promise<ApiUser> {
  const res = await fetch(`${API_BASE}/users/me`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  return handleResponse<ApiUser>(res);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${API_BASE}/users/me/password`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify({ currentPassword, newPassword }),
  });
  if (res.status === 401) { clearAuth(); window.location.href = "/login"; throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try { const json = JSON.parse(text); if (json.error) message = json.error; } catch { /* raw text */ }
    throw new Error(message);
  }
}

// ── Classes ──────────────────────────────────────────────────────────

export async function fetchClasses(): Promise<ApiClass[]> {
  const key = "classes";
  const cached = getCached<ApiClass[]>(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/classes`, {
    headers: authHeaders(),
  });
  const data = await handleResponse<ApiClass[]>(res);
  setCache(key, data);
  return data;
}

export async function createClass(data: {
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  label?: string;
}): Promise<ApiClass> {
  const res = await fetch(`${API_BASE}/classes`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiClass>(res);
  invalidateCache("classes");
  return result;
}

export async function deleteClass(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/classes/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("classes");
  invalidateCache(`overview:${id}`);
}

// ── Students ─────────────────────────────────────────────────────────

export async function fetchStudents(classId: string): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
    headers: authHeaders(),
  });
  return handleResponse<Student[]>(res);
}

export async function addStudent(classId: string, name: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ name }),
  });
  const result = await handleResponse<Student>(res);
  invalidateCache(`overview:${classId}`);
  return result;
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Terms ────────────────────────────────────────────────────────────

export async function fetchTerms(): Promise<TermPeriod[]> {
  const res = await fetch(`${API_BASE}/terms`, {
    headers: authHeaders(),
  });
  return handleResponse<TermPeriod[]>(res);
}

// ── Attendance ───────────────────────────────────────────────────────

export async function fetchAttendance(classId: string): Promise<ApiAttendance[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/attendance`, {
    headers: authHeaders(),
  });
  return handleResponse<ApiAttendance[]>(res);
}

export async function updateAttendance(data: {
  studentId: string;
  termKey: string;
  weekIndex: number;
  present: boolean;
}): Promise<ApiAttendance> {
  const res = await fetch(`${API_BASE}/attendance`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiAttendance>(res);
  invalidateCache("overview:");
  return result;
}

// ── Homework ─────────────────────────────────────────────────────────

export async function fetchHomework(classId: string): Promise<Homework[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/homework`, {
    headers: authHeaders(),
  });
  return handleResponse<Homework[]>(res);
}

export async function createHomework(
  classId: string,
  data: { title: string; termKey: string; weekIndex: number }
): Promise<Homework> {
  const res = await fetch(`${API_BASE}/classes/${classId}/homework`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<Homework>(res);
  invalidateCache(`overview:${classId}`);
  return result;
}

export async function deleteHomework(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/homework/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("overview:");
}

// ── Completions ──────────────────────────────────────────────────────

export async function fetchCompletions(classId: string): Promise<ApiCompletion[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/completions`, {
    headers: authHeaders(),
  });
  return handleResponse<ApiCompletion[]>(res);
}

export async function toggleCompletion(data: {
  studentId: string;
  homeworkId: string;
}): Promise<ApiCompletion> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiCompletion>(res);
  invalidateCache("overview:");
  return result;
}

// ── Exams ───────────────────────────────────────────────────────────

export interface ApiExam {
  id: string;
  title: string;
  examDate: string;
  classId: string;
  classLevel: string;
}

export async function fetchExams(start?: string, end?: string): Promise<ApiExam[]> {
  const key = `exams:${start ?? ""}:${end ?? ""}`;
  const cached = getCached<ApiExam[]>(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();
  const url = `${API_BASE}/exams${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await handleResponse<ApiExam[]>(res);
  setCache(key, data);
  return data;
}

export async function createExam(data: {
  classId: string;
  title: string;
  examDate: string;
}): Promise<ApiExam> {
  const res = await fetch(`${API_BASE}/exams`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiExam>(res);
  invalidateCache("exams:");
  invalidateCache("overview:");
  return result;
}

export async function deleteExam(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/exams/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("exams:");
  invalidateCache("overview:");
}

// ── Extra Lessons ───────────────────────────────────────────────────

export interface ApiExtraLesson {
  id: string;
  title: string;
  lessonDate: string;    // "YYYY-MM-DD"
  startTime: string;     // "HH:MM"
  endTime: string;       // "HH:MM"
  classId: string;
  classLevel: string;
}

export async function fetchExtraLessons(start?: string, end?: string): Promise<ApiExtraLesson[]> {
  const key = `extraLessons:${start ?? ""}:${end ?? ""}`;
  const cached = getCached<ApiExtraLesson[]>(key);
  if (cached) return cached;

  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();
  const url = `${API_BASE}/extra-lessons${qs ? `?${qs}` : ""}`;
  const res = await fetch(url, { headers: authHeaders() });
  const data = await handleResponse<ApiExtraLesson[]>(res);
  setCache(key, data);
  return data;
}

export async function createExtraLesson(data: {
  classId: string;
  title: string;
  lessonDate: string;
  startTime: string;
  endTime: string;
}): Promise<ApiExtraLesson> {
  const res = await fetch(`${API_BASE}/extra-lessons`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiExtraLesson>(res);
  invalidateCache("extraLessons:");
  invalidateCache("overview:");
  return result;
}

export async function deleteExtraLesson(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/extra-lessons/${id}`, { method: "DELETE", headers: authHeaders() });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("extraLessons:");
  invalidateCache("overview:");
}

// ── Payments ─────────────────────────────────────────────────────────

export async function fetchPayments(classId: string): Promise<ApiPayment[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/payments`, {
    headers: authHeaders(),
  });
  return handleResponse<ApiPayment[]>(res);
}

export async function updatePayment(data: {
  studentId: string;
  termKey: string;
  weekIndex: number;
  status: PaymentStatus;
}): Promise<ApiPayment> {
  const res = await fetch(`${API_BASE}/payments`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiPayment>(res);
  invalidateCache("overview:");
  return result;
}

// ── Admin ─────────────────────────────────────────────────────────────

export async function fetchAllUsers(): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/admin/users`, { headers: authHeaders() });
  return handleResponse<ApiUser[]>(res);
}

export async function fetchUserClasses(userId: string): Promise<ApiClass[]> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/classes`, { headers: authHeaders() });
  return handleResponse<ApiClass[]>(res);
}

export async function assignUserToClass(userId: string, classId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/classes/${classId}`, {
    method: "POST",
    headers: authHeaders(),
  });
  if (res.status === 401) { clearAuth(); window.location.href = "/login"; throw new Error("Unauthorized"); }
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text || `HTTP ${res.status}`;
    try { const json = JSON.parse(text); if (json.error) message = json.error; } catch { /* raw text */ }
    throw new Error(message);
  }
}

export async function unassignUserFromClass(userId: string, classId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/users/${userId}/classes/${classId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Topics ──────────────────────────────────────────────────────────

export async function fetchTopics(classId: string, classLevel: string): Promise<ApiTopic[]> {
  const res = await fetch(`${API_BASE}/topics?classId=${classId}&classLevel=${encodeURIComponent(classLevel)}`, { headers: authHeaders() });
  return handleResponse<ApiTopic[]>(res);
}

export async function createTopic(classLevel: string, name: string): Promise<ApiTopic> {
  const res = await fetch(`${API_BASE}/topics`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ classLevel, name }),
  });
  const result = await handleResponse<ApiTopic>(res);
  invalidateCache("overview:");
  return result;
}

export async function updateTopic(
  topicId: string,
  data: { name?: string; sortOrder?: number }
): Promise<ApiTopic> {
  const res = await fetch(`${API_BASE}/topics/${topicId}`, {
    method: "PUT",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiTopic>(res);
  invalidateCache("overview:");
  return result;
}

export async function toggleTopicVisibility(topicId: string, classId: string): Promise<ApiTopic> {
  const res = await fetch(`${API_BASE}/topics/${topicId}/visibility?classId=${classId}`, {
    method: "PUT",
    headers: authHeaders(),
  });
  const result = await handleResponse<ApiTopic>(res);
  invalidateCache("overview:");
  return result;
}

export async function deleteTopic(topicId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/topics/${topicId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("overview:");
}

// ── Resources ───────────────────────────────────────────────────────

export async function createResource(
  topicId: string,
  data: { title: string; driveUrl: string }
): Promise<ApiResource> {
  const res = await fetch(`${API_BASE}/topics/${topicId}/resources`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiResource>(res);
  invalidateCache("overview:");
  return result;
}

export async function deleteResource(topicId: string, resourceId: string): Promise<void> {
  const res = await fetch(`${API_BASE}/topics/${topicId}/resources/${resourceId}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("overview:");
}

// ── Chat ────────────────────────────────────────────────────────────

export async function sendChatMessage(message: string): Promise<string> {
  const res = await fetch(`${API_BASE}/chat`, {
    method: "POST",
    headers: authHeaders(),
    body: JSON.stringify({ message }),
  });
  const data = await handleResponse<{ reply: string }>(res);
  return data.reply;
}
