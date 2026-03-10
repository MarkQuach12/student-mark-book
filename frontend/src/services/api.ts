import { getCurrentUser } from "../utils/authStorage";
import type { Student, Homework, PaymentStatus } from "../pages/classPage/types";
import type { TermPeriod } from "../pages/classPage/termData";

const API_BASE = "http://localhost:8080/api";

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

// ── Helpers ────────────────────────── ────────────────────────────────

function getUserId(): string {
  const user = getCurrentUser();
  if (!user) throw new Error("Not authenticated");
  return user.email;
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json() as Promise<T>;
}

function headers(extra?: Record<string, string>): Record<string, string> {
  return { "Content-Type": "application/json", ...extra };
}

// ── API response types (where they differ from existing frontend types) ──

export interface ApiClass {
  id: string;
  classLevel: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  name: string;
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

export interface ClassOverviewResponse {
  classInfo: ApiClass;
  students: Student[];
  homework: Homework[];
  attendance: ApiAttendance[];
  completions: ApiCompletion[];
  payments: ApiPayment[];
  terms: TermPeriod[];
}

export async function fetchClassOverview(classId: string): Promise<ClassOverviewResponse> {
  const key = `overview:${classId}`;
  const cached = getCached<ClassOverviewResponse>(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/classes/${classId}/overview`, {
    headers: { "X-User-Id": getUserId() },
  });
  const data = await handleResponse<ClassOverviewResponse>(res);
  setCache(key, data);
  return data;
}

// ── Classes ──────────────────────────────────────────────────────────

export async function fetchClasses(): Promise<ApiClass[]> {
  const key = "classes";
  const cached = getCached<ApiClass[]>(key);
  if (cached) return cached;

  const res = await fetch(`${API_BASE}/classes`, {
    headers: { "X-User-Id": getUserId() },
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
}): Promise<ApiClass> {
  const res = await fetch(`${API_BASE}/classes`, {
    method: "POST",
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiClass>(res);
  invalidateCache("classes");
  return result;
}

export async function deleteClass(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/classes/${id}`, { method: "DELETE", headers: { "X-User-Id": getUserId() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("classes");
  invalidateCache(`overview:${id}`);
}

// ── Students ─────────────────────────────────────────────────────────

export async function fetchStudents(classId: string): Promise<Student[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
    headers: { "X-User-Id": getUserId() },
  });
  return handleResponse<Student[]>(res);
}

export async function addStudent(classId: string, name: string): Promise<Student> {
  const res = await fetch(`${API_BASE}/classes/${classId}/students`, {
    method: "POST",
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify({ name }),
  });
  const result = await handleResponse<Student>(res);
  invalidateCache(`overview:${classId}`);
  return result;
}

export async function deleteStudent(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/students/${id}`, { method: "DELETE", headers: { "X-User-Id": getUserId() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}

// ── Terms ────────────────────────────────────────────────────────────

export async function fetchTerms(): Promise<TermPeriod[]> {
  const res = await fetch(`${API_BASE}/terms`, {
    headers: { "X-User-Id": getUserId() },
  });
  return handleResponse<TermPeriod[]>(res);
}

// ── Attendance ───────────────────────────────────────────────────────

export async function fetchAttendance(classId: string): Promise<ApiAttendance[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/attendance`, {
    headers: { "X-User-Id": getUserId() },
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
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiAttendance>(res);
  invalidateCache("overview:");
  return result;
}

// ── Homework ─────────────────────────────────────────────────────────

export async function fetchHomework(classId: string): Promise<Homework[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/homework`, {
    headers: { "X-User-Id": getUserId() },
  });
  return handleResponse<Homework[]>(res);
}

export async function createHomework(
  classId: string,
  data: { title: string; termKey: string; weekIndex: number }
): Promise<Homework> {
  const res = await fetch(`${API_BASE}/classes/${classId}/homework`, {
    method: "POST",
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<Homework>(res);
  invalidateCache(`overview:${classId}`);
  return result;
}

export async function deleteHomework(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/homework/${id}`, { method: "DELETE", headers: { "X-User-Id": getUserId() } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  invalidateCache("overview:");
}

// ── Completions ──────────────────────────────────────────────────────

export async function fetchCompletions(classId: string): Promise<ApiCompletion[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/completions`, {
    headers: { "X-User-Id": getUserId() },
  });
  return handleResponse<ApiCompletion[]>(res);
}

export async function toggleCompletion(data: {
  studentId: string;
  homeworkId: string;
}): Promise<ApiCompletion> {
  const res = await fetch(`${API_BASE}/completions`, {
    method: "PUT",
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiCompletion>(res);
  invalidateCache("overview:");
  return result;
}

// ── Payments ─────────────────────────────────────────────────────────

export async function fetchPayments(classId: string): Promise<ApiPayment[]> {
  const res = await fetch(`${API_BASE}/classes/${classId}/payments`, {
    headers: { "X-User-Id": getUserId() },
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
    headers: headers({ "X-User-Id": getUserId() }),
    body: JSON.stringify(data),
  });
  const result = await handleResponse<ApiPayment>(res);
  invalidateCache("overview:");
  return result;
}
