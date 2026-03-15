# Student Mark Book

Full-stack app for managing student classes, attendance, homework completion, exams, and payments. Organized by terms and weeks.

## Development

- **Frontend** (`frontend/`): `npm install`, `npm run dev` (port 5173)
- **Backend** (`backend/`): `mvn spring-boot:run` (port 8080)

## Architecture — Non-Obvious Details

- API base URL is hardcoded in `frontend/src/services/api.ts`
- Auth uses JWT Bearer tokens — login/signup via `POST /api/auth/login` and `/signup`
- Two roles: **admin** (sees all classes) and **standard user** (sees only assigned classes via `UserClassAssignment`)
- Backend auto-creates users on first class access
- `ClassEntity` is the JPA entity name because `Class` is a Java reserved word
- Term primary keys are strings ("term1", "term2"), not UUIDs
- Class colors are stored client-side in localStorage per user (`classColors_<email>`)

## Key Data Model

- **ClassEntity** — the central entity. Has students, homework, attendance, payments, and exams
- **Exam** — belongs to a ClassEntity (FK `class_id`). Users see exams only for their assigned classes
- **UserClassAssignment** — bridge table for user-to-class access. Admin bypasses this
- **Student** — belongs to a class
- **Homework** — belongs to a class, scoped to a term+week
- **Attendance** — per student, per term+week
- **Payment** — per student, per term+week (statuses: unpaid, paid, away)
- **Term/TermWeek** — shared across all classes, term keys are strings

## Frontend Structure

- `frontend/src/services/api.ts` — all API calls, types (`ApiClass`, `ApiExam`, etc.), caching (5min TTL)
- `frontend/src/pages/landingPage.tsx` — grid/calendar toggle, loads classes + exams
- `frontend/src/pages/classPage.tsx` — class detail with students, homework, attendance, payments, exams
- `frontend/src/components/calendar/` — WeeklyCalendar, CalendarClassBlock, CalendarExamBlock, AddExamDialog
- `frontend/src/components/` — ClassHeader, TermSelector, WeekTabs, WeekContent, AddHomeworkDialog, etc.
- `frontend/src/utils/classColors.ts` — per-class color customization

## Backend Structure

- `backend/src/main/java/com/markbook/backend/`
  - `model/` — JPA entities (ClassEntity, Exam, Student, Homework, Attendance, Payment, User, Term, TermWeek, UserClassAssignment)
  - `repository/` — Spring Data JPA repos
  - `service/` — business logic (ClassService, ExamService, etc.)
  - `controller/` — REST endpoints under `/api/`
  - `dto/` — response DTOs; `dto/request/` — request DTOs
  - `security/` — JwtUtil, JwtAuthenticationFilter, SecurityUtils (getCurrentUserId, isAdmin)
  - `config/` — SecurityConfig, CorsConfig, AdminSeeder
- SQL migrations in `backend/sql/` — applied manually against Neon

## Database

- Neon PostgreSQL (cloud, SSL required), credentials in `application.properties`
- `ddl-auto=validate` — Hibernate will NOT create or modify tables
- **No migration tool** — schema changes must be applied manually via SQL against Neon
- Do not change `ddl-auto` from `validate` without coordinating schema changes

## API Endpoints (Key)

- `GET /api/classes` — user's classes (admin: all)
- `GET /api/classes/{id}/overview` — aggregate: class info + students + homework + attendance + completions + payments + terms + exams
- `GET /api/exams?start=&end=` — exams for user's assigned classes (date range optional)
- `POST /api/exams` — create exam (requires `classId`, `title`, `examDate`)
- `DELETE /api/exams/{id}` — delete exam (access checked via class)
- `POST /api/auth/login`, `POST /api/auth/signup` — authentication
- `GET /api/admin/users`, assignment endpoints under `/api/admin/`
