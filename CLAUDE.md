# Student Mark Book

Full-stack app for managing student classes, attendance, homework completion, and payments. Organized by terms and weeks.

## Development

- **Frontend** (`frontend/`): `npm install`, `npm run dev` (port 5173)
- **Backend** (`backend/`): `mvn spring-boot:run` (port 8080)

## Architecture — Non-Obvious Details

- API base URL is hardcoded in `frontend/src/services/api.ts`
- Auth uses a custom `X-User-Id` header (user email), not JWT/OAuth — login/signup is frontend-only (localStorage)
- Backend auto-creates users on first class access
- `ClassEntity` is the JPA entity name because `Class` is a Java reserved word
- Term primary keys are strings ("term1", "term2"), not UUIDs

## Database

- Neon PostgreSQL (cloud, SSL required), credentials in `application.properties`
- `ddl-auto=validate` — Hibernate will NOT create or modify tables
- **No migration tool** — schema changes must be applied manually via SQL against Neon
- Do not change `ddl-auto` from `validate` without coordinating schema changes
