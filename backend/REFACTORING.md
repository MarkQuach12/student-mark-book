# Backend Refactoring Guide

A prioritized roadmap for improving the Spring Boot backend. Issues are grouped by severity and impact.

---

## Current State

The backend is a Spring Boot 3 + JPA + PostgreSQL app organized into a standard layered architecture (controller → service → repository → entity). The domain model is clear and mostly correct. The main gaps are around validation, error handling, code duplication, logging, and security.

**What works well:**
- Clean layered architecture
- Consistent package structure
- `ddl-auto=validate` prevents accidental schema drift
- JOIN FETCH queries in repositories avoid some N+1 issues
- `CompletableFuture` for parallel queries in `ClassService.getClassOverview`

**What needs work:**
- No input validation anywhere
- All exceptions are generic `RuntimeException` → always returns HTTP 500
- Every controller builds `Map<String, Object>` responses by hand — duplicated 20+ times
- Zero logging
- No authorization — any user can modify any class or student
- Database credentials are committed to source control

---

## Tier 1 — Critical (Fix Before Production)

### 1. Add a Global Exception Handler

**Problem:** All services throw `new RuntimeException("message")`. Spring returns HTTP 500 for everything — a missing class, a bad request, and a server crash all look the same to the client.

**Fix:** Create `exception/GlobalExceptionHandler.java`:

```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
            .map(e -> e.getField() + ": " + e.getDefaultMessage())
            .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }
}
```

Create `exception/ResourceNotFoundException.java`:

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) { super(message); }
}
```

Then replace every `throw new RuntimeException(...)` with the appropriate typed exception.

**Files to change:**
- Create: [exception/GlobalExceptionHandler.java](src/main/java/com/markbook/backend/exception/GlobalExceptionHandler.java)
- Create: [exception/ResourceNotFoundException.java](src/main/java/com/markbook/backend/exception/ResourceNotFoundException.java)
- Edit: [service/ClassService.java](src/main/java/com/markbook/backend/service/ClassService.java) — lines 54, 82
- Edit: [service/StudentService.java](src/main/java/com/markbook/backend/service/StudentService.java) — line 31
- Edit: [service/AttendanceService.java](src/main/java/com/markbook/backend/service/AttendanceService.java) — lines 43, 45
- Edit: [service/HomeworkService.java](src/main/java/com/markbook/backend/service/HomeworkService.java) — lines 43, 45
- Edit: [service/PaymentService.java](src/main/java/com/markbook/backend/service/PaymentService.java) — lines 43, 45

---

### 2. Add Input Validation

**Problem:** Request bodies are never validated. A null student name, empty class level, or missing required field silently creates bad data.

**Fix:** Add Bean Validation annotations to request record/DTO classes, then annotate controller parameters with `@Valid`.

Example for a new `CreateStudentRequest` record:

```java
public record CreateStudentRequest(@NotBlank String name) {}
```

Controller:

```java
@PostMapping("/{classId}/students")
public ResponseEntity<StudentDTO> addStudent(
    @PathVariable UUID classId,
    @RequestBody @Valid CreateStudentRequest req) { ... }
```

**Files to change:**
- Create request records for each endpoint that accepts a body (ClassController, StudentController, HomeworkController, AttendanceController, PaymentController)
- Add `@Valid` to each `@RequestBody` parameter

---

### 3. Move Database Credentials to Environment Variables

**Problem:** `application.properties` contains the Neon PostgreSQL URL, username, and password in plain text and is checked into source control.

**Fix:**

`application.properties`:
```properties
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
```

Create `application-local.properties` (add to `.gitignore`):
```properties
DATABASE_URL=jdbc:postgresql://...
DATABASE_USERNAME=...
DATABASE_PASSWORD=...
```

Or use OS environment variables / a secrets manager in production.

**Files to change:**
- Edit: [src/main/resources/application.properties](src/main/resources/application.properties)
- Create: `src/main/resources/application-local.properties` (git-ignored)
- Edit: `.gitignore`

---

### 4. Authorization Checks

**Problem:** The `X-User-Id` header is set by the frontend from `localStorage`. There is no server-side check that the user making the request actually owns the class or student being modified.

**Fix (minimal, without adding JWT):** Before any mutation, verify the resource belongs to the authenticated user:

```java
// In ClassService.deleteClass:
ClassEntity cls = classRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
if (!cls.getUser().getId().equals(userId)) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
}
```

Apply the same pattern to student delete, homework delete, and attendance/payment updates.

**Files to change:**
- [service/ClassService.java](src/main/java/com/markbook/backend/service/ClassService.java)
- [service/StudentService.java](src/main/java/com/markbook/backend/service/StudentService.java)
- [service/HomeworkService.java](src/main/java/com/markbook/backend/service/HomeworkService.java)
- [service/AttendanceService.java](src/main/java/com/markbook/backend/service/AttendanceService.java)
- [service/PaymentService.java](src/main/java/com/markbook/backend/service/PaymentService.java)

---

## Tier 2 — Important (Code Quality)

### 5. Replace Map-Based Responses with Typed DTOs

**Problem:** Every controller builds responses using `Map.of("id", x, "name", y, ...)`. This pattern is repeated 20+ times across all controllers. It's fragile (typos in keys go undetected), hard to document, and provides no IDE support.

**Fix:** Create a DTO record for each domain type. Example:

```java
// dto/StudentDTO.java
public record StudentDTO(UUID id, String name, String createdAt) {
    public static StudentDTO from(Student s) {
        return new StudentDTO(s.getId(), s.getName(), s.getCreatedAt().toString());
    }
}
```

Then in the controller:
```java
return students.stream().map(StudentDTO::from).toList();
```

**DTOs to create:**
- `StudentDTO`
- `HomeworkDTO`
- `AttendanceDTO`
- `HomeworkCompletionDTO`
- `PaymentDTO`
- `TermDTO` / `TermWeekDTO`
- Update `ClassOverviewDTO` to use typed fields instead of `Map<String, Object>`

**Files to change:**
- Create: [dto/](src/main/java/com/markbook/backend/dto/) — add the above records
- Edit: All 6 controllers to use DTOs instead of inline maps
- Edit: [dto/ClassOverviewDTO.java](src/main/java/com/markbook/backend/dto/ClassOverviewDTO.java) — replace `Map<String, Object>` fields

---

### 6. Add Logging

**Problem:** There is no logging anywhere in the application. Debugging production issues requires guesswork.

**Fix:** Add `@Slf4j` (from Lombok) to all service classes and log at appropriate levels:

```java
@Service
@Slf4j
public class ClassService {
    public ClassEntity createClass(...) {
        log.info("Creating class for user={} level={} day={}", userId, classLevel, dayOfWeek);
        // ...
        log.debug("Class created with id={}", cls.getId());
        return cls;
    }

    public void deleteClass(UUID id) {
        log.warn("Deleting class id={}", id);
        // ...
    }
}
```

Log levels to use:
- `INFO` — create/update/delete operations
- `DEBUG` — query results, method entry/exit in complex flows
- `WARN` — deletions, unexpected-but-handled states
- `ERROR` — caught exceptions before rethrowing

**Files to change:** All service classes.

---

### 7. Add `@Transactional` to Write Methods

**Problem:** Write methods in services (create, update, delete) don't have `@Transactional`. If a multi-step operation fails midway (e.g., creating a class then linking the user), partial state can be committed.

**Fix:**

```java
@Transactional
public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, ...) { ... }

@Transactional
public void deleteClass(UUID id) { ... }
```

Read methods already use `@Transactional(readOnly = true)` correctly in most places — keep those.

**Files to change:** All service classes — add `@Transactional` to create/update/delete methods.

---

### 8. Convert Magic Strings to Enums

**Problem:** `dayOfWeek` in `ClassEntity` and `status` in `Payment` are stored as arbitrary strings. There is no validation that a payment status is actually "paid", "unpaid", or "pending".

**Fix:**

```java
// model/enums/DayOfWeek.java
public enum DayOfWeek { MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY }

// model/enums/PaymentStatus.java
public enum PaymentStatus { PAID, UNPAID, PENDING }
```

In the entity, change the field type and add `@Enumerated(EnumType.STRING)`:

```java
@Enumerated(EnumType.STRING)
@Column(name = "day_of_week")
private DayOfWeek dayOfWeek;
```

> **Note:** The DB columns currently store lowercase strings. Either update the DB values to match the enum names, or use a converter to map them.

**Files to change:**
- Create: `model/enums/DayOfWeek.java`, `model/enums/PaymentStatus.java`
- Edit: [model/ClassEntity.java](src/main/java/com/markbook/backend/model/ClassEntity.java)
- Edit: [model/Payment.java](src/main/java/com/markbook/backend/model/Payment.java)

---

### 9. Clean Up Unused Repository Methods

**Problem:** Several repositories have both an unused auto-generated method and a custom JOIN FETCH method for the same query. The unused methods clutter the interface and could be mistakenly called without the JOIN FETCH, causing N+1 queries.

**Unused methods to remove:**
- `AttendanceRepository.findByStudentClassEntityId` (use `findByClassIdWithFetch` instead)
- `HomeworkRepository.findByClassEntityId` (use `findByClassIdWithFetch` instead)
- `HomeworkCompletionRepository.findByHomeworkClassEntityId` (use `findByClassIdWithFetch` instead)
- `PaymentRepository.findByStudentClassEntityId` (use `findByClassIdWithFetch` instead)
- `TermRepository.findAllByOrderBySortOrderAsc` (use `findAllWithWeeks` instead)

**Files to change:**
- [repository/AttendanceRepository.java](src/main/java/com/markbook/backend/repository/AttendanceRepository.java)
- [repository/HomeworkRepository.java](src/main/java/com/markbook/backend/repository/HomeworkRepository.java)
- [repository/HomeworkCompletionRepository.java](src/main/java/com/markbook/backend/repository/HomeworkCompletionRepository.java)
- [repository/PaymentRepository.java](src/main/java/com/markbook/backend/repository/PaymentRepository.java)
- [repository/TermRepository.java](src/main/java/com/markbook/backend/repository/TermRepository.java)

---

## Tier 3 — Technical Debt (Improve Over Time)

### 10. Simplify ClassService

**Problem:** `ClassService` has 8 injected dependencies and a 156-line class. `getClassOverview` uses `CompletableFuture` for 5 parallel queries with no timeout protection, making it hard to reason about and test.

**Options:**
- **Simple:** Replace `CompletableFuture` with sequential queries. The DB is Neon (fast); sequential is usually fast enough and far simpler.
- **Better:** Extract a `ClassOverviewAssembler` class that takes the raw data and builds the response, keeping `ClassService` focused on persistence.

```java
// service/ClassOverviewAssembler.java
@Component
public class ClassOverviewAssembler {
    public ClassOverviewDTO assemble(ClassEntity cls, List<Student> students, ...) { ... }
}
```

---

### 11. Add Caching for Terms

**Problem:** Terms and weeks are static reference data that never change, but they are re-fetched from the DB on every request.

**Fix:**

```java
@Service
public class TermService {
    @Cacheable("terms")
    public List<Term> getAllTerms() {
        return termRepository.findAllWithWeeks();
    }
}
```

Enable caching in `BackendApplication.java` with `@EnableCaching`.

---

### 12. Add Pagination to List Endpoints

**Problem:** List endpoints (`/students`, `/homework`, `/attendance`) return unbounded result sets. A class with hundreds of students and months of data could return thousands of rows.

**Fix:** Add `Pageable` support to repository methods and accept `page`/`size` query params in controllers.

---

### 13. Fix CORS for Production

**Problem:** `CorsConfig` hardcodes `localhost:5173` as the allowed origin. This will not work when deployed.

**Fix:** Make the allowed origins configurable via a property:

```properties
# application.properties
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173}
```

```java
@Value("${cors.allowed-origins}")
private String[] allowedOrigins;
```

**File to change:** [config/CorsConfig.java](src/main/java/com/markbook/backend/config/CorsConfig.java)

---

### 14. Add API Documentation (Swagger)

Add `springdoc-openapi-starter-webmvc-ui` to `pom.xml`:

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

Swagger UI will be available at `http://localhost:8080/swagger-ui.html`. Add `@Operation` and `@Tag` annotations to controllers for richer docs.

---

### 15. Add Tests

The codebase has zero tests. Minimum recommended coverage:

| Type | What to test |
|---|---|
| Unit tests | Service logic: upsert, toggle, auto-create user, class overview assembly |
| Integration tests | Controller endpoints with MockMvc: happy path + error cases |
| Repository tests | Custom JPQL queries with `@DataJpaTest` |

Framework: JUnit 5 + Mockito (already in Spring Boot test starter). Add `@SpringBootTest` integration tests using an H2 in-memory DB or Testcontainers with Postgres.

---

## Refactoring Order (Recommended)

| # | Task | Risk | Effort |
|---|---|---|---|
| 1 | Global exception handler + custom exceptions | Low | Small |
| 2 | Input validation on request bodies | Low | Small |
| 3 | Move credentials to env vars | Low | Trivial |
| 4 | Authorization checks | Medium | Medium |
| 5 | `@Transactional` on write methods | Low | Small |
| 6 | Logging in all services | Low | Small |
| 7 | Typed DTOs (replace Map responses) | Medium | Medium |
| 8 | Enums for dayOfWeek and payment status | Medium | Small |
| 9 | Remove unused repository methods | Low | Trivial |
| 10 | CORS configurable via property | Low | Trivial |
| 11 | Simplify ClassService | Medium | Medium |
| 12 | Add caching for Terms | Low | Small |
| 13 | Pagination for list endpoints | Low | Medium |
| 14 | Swagger documentation | Low | Small |
| 15 | Unit and integration tests | Low | Large |
