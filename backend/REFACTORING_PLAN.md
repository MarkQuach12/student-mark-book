# Backend Refactoring — Detailed Implementation Plan

Each step is self-contained and safe to apply independently. Steps within a tier can generally be done in any order; complete Tier 1 before moving to Tier 2.

---

## Tier 1 — Critical

---

### Step 1 — Global Exception Handler + Custom Exceptions

**Why:** Every `RuntimeException` in the codebase returns HTTP 500. Clients can't distinguish "class not found" from a real server crash.

#### 1a. Create `ResourceNotFoundException`

**New file:** `src/main/java/com/markbook/backend/exception/ResourceNotFoundException.java`

```java
package com.markbook.backend.exception;

public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

#### 1b. Create `GlobalExceptionHandler`

**New file:** `src/main/java/com/markbook/backend/exception/GlobalExceptionHandler.java`

```java
package com.markbook.backend.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleNotFound(ResourceNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadRequest(IllegalArgumentException ex) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", ex.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> handleValidation(MethodArgumentNotValidException ex) {
        String message = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.badRequest().body(Map.of("error", message));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGeneric(Exception ex) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("error", "An unexpected error occurred"));
    }
}
```

#### 1c. Replace `RuntimeException` throws in all services

For each service, replace every `throw new RuntimeException("X not found")` with `throw new ResourceNotFoundException("X not found")` and add the import:
```java
import com.markbook.backend.exception.ResourceNotFoundException;
```

**`ClassService.java`:**
- Line 54: `throw new RuntimeException("Class not found")` → `throw new ResourceNotFoundException("Class not found")`
- Line 82: `throw new RuntimeException("Class not found")` → `throw new ResourceNotFoundException("Class not found")`

**`StudentService.java`:**
- Line 31: `throw new RuntimeException("Class not found")` → `throw new ResourceNotFoundException("Class not found")`

**`HomeworkService.java`:**
- Line 43: `throw new RuntimeException("Class not found")` → `throw new ResourceNotFoundException("Class not found")`
- Line 45: `throw new RuntimeException("Term not found")` → `throw new ResourceNotFoundException("Term not found")`
- Line 73: `throw new RuntimeException("Student not found")` → `throw new ResourceNotFoundException("Student not found")`
- Line 75: `throw new RuntimeException("Homework not found")` → `throw new ResourceNotFoundException("Homework not found")`

**`AttendanceService.java`:**
- Line 43: `throw new RuntimeException("Student not found")` → `throw new ResourceNotFoundException("Student not found")`
- Line 45: `throw new RuntimeException("Term not found")` → `throw new ResourceNotFoundException("Term not found")`

**`PaymentService.java`:**
- Line 43: `throw new RuntimeException("Student not found")` → `throw new ResourceNotFoundException("Student not found")`
- Line 45: `throw new RuntimeException("Term not found")` → `throw new ResourceNotFoundException("Term not found")`

---

### Step 2 — Input Validation

**Why:** Request bodies are currently `Map<String, Object>` with no validation. A null `name`, empty `title`, or unparseable `startTime` will either silently persist bad data or throw an unhandled `NullPointerException`.

#### 2a. Add `spring-boot-starter-validation` to `pom.xml`

In `pom.xml`, inside `<dependencies>`, add:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-validation</artifactId>
</dependency>
```

#### 2b. Create request record classes

**New file:** `src/main/java/com/markbook/backend/dto/request/CreateClassRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateClassRequest(
    @NotBlank(message = "classLevel is required") String classLevel,
    @NotBlank(message = "dayOfWeek is required") String dayOfWeek,
    @NotNull(message = "startTime is required") String startTime,
    @NotNull(message = "endTime is required") String endTime
) {}
```

**New file:** `src/main/java/com/markbook/backend/dto/request/CreateStudentRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateStudentRequest(
    @NotBlank(message = "name is required")
    @Size(max = 100, message = "name must be 100 characters or fewer")
    String name
) {}
```

**New file:** `src/main/java/com/markbook/backend/dto/request/CreateHomeworkRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreateHomeworkRequest(
    @NotBlank(message = "title is required")
    @Size(max = 100, message = "title must be 100 characters or fewer")
    String title,

    @NotBlank(message = "termKey is required") String termKey,
    @NotNull(message = "weekIndex is required") Short weekIndex
) {}
```

**New file:** `src/main/java/com/markbook/backend/dto/request/UpdateAttendanceRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdateAttendanceRequest(
    @NotNull(message = "studentId is required") UUID studentId,
    @NotNull(message = "termKey is required") String termKey,
    @NotNull(message = "weekIndex is required") Short weekIndex,
    @NotNull(message = "present is required") Boolean present
) {}
```

**New file:** `src/main/java/com/markbook/backend/dto/request/UpdatePaymentRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record UpdatePaymentRequest(
    @NotNull(message = "studentId is required") UUID studentId,
    @NotNull(message = "termKey is required") String termKey,
    @NotNull(message = "weekIndex is required") Short weekIndex,
    @NotBlank(message = "status is required") String status
) {}
```

**New file:** `src/main/java/com/markbook/backend/dto/request/ToggleCompletionRequest.java`

```java
package com.markbook.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import java.util.UUID;

public record ToggleCompletionRequest(
    @NotNull(message = "studentId is required") UUID studentId,
    @NotNull(message = "homeworkId is required") UUID homeworkId
) {}
```

#### 2c. Update controllers to use request records

**`ClassController.java`** — replace `@RequestBody Map<String, String> body` on `createClass`:

```java
// Before (line 39-40):
public Map<String, Object> createClass(@RequestHeader("X-User-Id") String userId,
                                       @RequestBody Map<String, String> body)

// After:
public Map<String, Object> createClass(@RequestHeader("X-User-Id") String userId,
                                       @RequestBody @Valid CreateClassRequest body)
```

Then update the body field accesses from `body.get("classLevel")` to `body.classLevel()`, etc. Also add imports:
```java
import com.markbook.backend.dto.request.CreateClassRequest;
import jakarta.validation.Valid;
```

**`StudentController.java`** — replace `@RequestBody Map<String, String> body` on `addStudent`:

```java
// Before (line 33-34):
public Map<String, Object> addStudent(@PathVariable UUID classId,
                                      @RequestBody Map<String, String> body)

// After:
public Map<String, Object> addStudent(@PathVariable UUID classId,
                                      @RequestBody @Valid CreateStudentRequest body)
```

Then change `body.get("name")` → `body.name()`.

**`HomeworkController.java`** — replace `@RequestBody Map<String, Object> body` on `createHomework`:

```java
// Before (line 45-46):
public Map<String, Object> createHomework(@PathVariable UUID classId,
                                          @RequestBody Map<String, Object> body)

// After:
public Map<String, Object> createHomework(@PathVariable UUID classId,
                                          @RequestBody @Valid CreateHomeworkRequest body)
```

Then update the service call:
```java
// Before (lines 47-52):
Homework homework = homeworkService.createHomework(
    classId,
    (String) body.get("title"),
    (String) body.get("termKey"),
    ((Number) body.get("weekIndex")).shortValue()
);

// After:
Homework homework = homeworkService.createHomework(
    classId,
    body.title(),
    body.termKey(),
    body.weekIndex()
);
```

**`AttendanceController.java`** — replace `@RequestBody Map<String, Object> body` on `updateAttendance`:

```java
// Before (line 34):
public Map<String, Object> updateAttendance(@RequestBody Map<String, Object> body)

// After:
public Map<String, Object> updateAttendance(@RequestBody @Valid UpdateAttendanceRequest body)
```

Then update the service call to use `body.studentId()`, `body.termKey()`, `body.weekIndex()`, `body.present()`. This also removes the unsafe `((Number) body.get("weekIndex")).shortValue()` cast on line 38.

**`PaymentController.java`** — replace `@RequestBody Map<String, Object> body` on `updatePayment`:

```java
// Before (line 34):
public Map<String, Object> updatePayment(@RequestBody Map<String, Object> body)

// After:
public Map<String, Object> updatePayment(@RequestBody @Valid UpdatePaymentRequest body)
```

Update service call to `body.studentId()`, `body.termKey()`, `body.weekIndex()`, `body.status()`.

**`HomeworkController.java`** — replace `@RequestBody Map<String, String> body` on `toggleCompletion`:

```java
// Before (line 80):
public Map<String, Object> toggleCompletion(@RequestBody Map<String, String> body)

// After:
public Map<String, Object> toggleCompletion(@RequestBody @Valid ToggleCompletionRequest body)
```

Update to `body.studentId()`, `body.homeworkId()` (and remove the `UUID.fromString(...)` wrapping since the record handles it).

---

### Step 3 — Move Database Credentials to Environment Variables

**Why:** The Neon PostgreSQL URL and credentials are committed in plain text to `application.properties`.

#### 3a. Update `application.properties`

**File:** `src/main/resources/application.properties`

Replace the three hardcoded lines:
```properties
# Before:
spring.datasource.url=jdbc:postgresql://...neon.tech/neondb?sslmode=require
spring.datasource.username=neondb_owner
spring.datasource.password=<actual-password>

# After:
spring.datasource.url=${DATABASE_URL}
spring.datasource.username=${DATABASE_USERNAME}
spring.datasource.password=${DATABASE_PASSWORD}
```

#### 3b. Create `application-local.properties`

**New file:** `src/main/resources/application-local.properties`

```properties
DATABASE_URL=jdbc:postgresql://...neon.tech/neondb?sslmode=require
DATABASE_USERNAME=neondb_owner
DATABASE_PASSWORD=<actual-password>
```

This file holds local dev credentials and must **not** be committed to source control.

#### 3c. Update `.gitignore`

Add to the root `.gitignore`:
```
backend/src/main/resources/application-local.properties
```

#### 3d. Activate the `local` profile for local development

Either:
- Set the env var `SPRING_PROFILES_ACTIVE=local` in your IDE run config, or
- Pass `-Dspring.profiles.active=local` to the Maven command

In production (e.g., Render, Railway, Fly.io), set `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD` as real environment variables.

---

### Step 4 — Authorization Checks

**Why:** The `X-User-Id` header is set by the frontend and is never verified server-side. Any user who knows a class UUID can delete it, add students to it, or read its data.

#### 4a. Pass `userId` through to delete operations

**`ClassController.java`** — add `X-User-Id` header to `deleteClass`:

```java
// Before (line 64-67):
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteClass(@PathVariable UUID id) {
    classService.deleteClass(id);
    return ResponseEntity.noContent().build();
}

// After:
@DeleteMapping("/{id}")
public ResponseEntity<Void> deleteClass(@PathVariable UUID id,
                                        @RequestHeader("X-User-Id") String userId) {
    classService.deleteClass(id, userId);
    return ResponseEntity.noContent().build();
}
```

**`ClassService.java`** — add ownership check to `deleteClass`:

```java
// Before (line 74-76):
public void deleteClass(UUID id) {
    classRepository.deleteById(id);
}

// After:
@Transactional
public void deleteClass(UUID id, String userId) {
    ClassEntity cls = classRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Class not found"));
    if (!cls.getUser().getId().equals(userId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
    classRepository.delete(cls);
}
```

Add imports to `ClassService`:
```java
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
```

#### 4b. Add ownership check to `getClassOverview`

**`ClassController.java`** — add `X-User-Id` to the overview endpoint:

```java
// Before (line 59-62):
@GetMapping("/{id}/overview")
public ClassOverviewDTO getClassOverview(@PathVariable UUID id) {
    return classService.getClassOverview(id);
}

// After:
@GetMapping("/{id}/overview")
public ClassOverviewDTO getClassOverview(@PathVariable UUID id,
                                         @RequestHeader("X-User-Id") String userId) {
    return classService.getClassOverview(id, userId);
}
```

**`ClassService.java`** — add check inside `getClassOverview`:

```java
// After fetching classEntity on line 81-82, add:
if (!classEntity.getUser().getId().equals(userId)) {
    throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
}
```

And update the method signature from `getClassOverview(UUID classId)` to `getClassOverview(UUID classId, String userId)`.

#### 4c. Guard `StudentController.deleteStudent`

The student delete currently takes only a `UUID`. There is no way to verify ownership without an extra query. Update `StudentService.deleteStudent` to:

```java
// After:
@Transactional
public void deleteStudent(UUID id, String userId) {
    Student student = studentRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
    if (!student.getClassEntity().getUser().getId().equals(userId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }
    studentRepository.delete(student);
}
```

> **Note:** `student.getClassEntity()` is LAZY. Because this runs inside `@Transactional`, the proxy will load the class and then the user in two extra queries. This is acceptable for a delete path. If it becomes a performance issue, add a JPQL query that joins student → class → user in one shot.

Update `StudentController.deleteStudent` to pass `@RequestHeader("X-User-Id") String userId` and forward it.

---

## Tier 2 — Code Quality

---

### Step 5 — Typed DTOs (Replace All `Map<String, Object>` Responses)

**Why:** `Map.of("id", x, "name", y, ...)` is repeated 20+ times across all controllers. A typo in a key is a silent bug. Typed records give compile-time safety and eliminate duplication.

#### 5a. Create response DTO records

**New file:** `src/main/java/com/markbook/backend/dto/ClassDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.ClassEntity;
import java.util.UUID;

public record ClassDTO(UUID id, String classLevel, String dayOfWeek,
                       String startTime, String endTime, String name) {
    public static ClassDTO from(ClassEntity c) {
        return new ClassDTO(c.getId(), c.getClassLevel(), c.getDayOfWeek(),
                c.getStartTime().toString(), c.getEndTime().toString(), c.getName());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/StudentDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.Student;
import java.util.UUID;

public record StudentDTO(UUID id, String name) {
    public static StudentDTO from(Student s) {
        return new StudentDTO(s.getId(), s.getName());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/HomeworkDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.Homework;
import java.util.UUID;

public record HomeworkDTO(UUID id, String title, String termKey, Short weekIndex) {
    public static HomeworkDTO from(Homework h) {
        return new HomeworkDTO(h.getId(), h.getTitle(), h.getTerm().getKey(), h.getWeekIndex());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/AttendanceDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.Attendance;
import java.util.UUID;

public record AttendanceDTO(UUID studentId, String termKey, Short weekIndex, Boolean present) {
    public static AttendanceDTO from(Attendance a) {
        return new AttendanceDTO(a.getStudent().getId(), a.getTerm().getKey(),
                a.getWeekIndex(), a.getPresent());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/HomeworkCompletionDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.HomeworkCompletion;
import java.util.UUID;

public record HomeworkCompletionDTO(UUID studentId, UUID homeworkId, Boolean completed) {
    public static HomeworkCompletionDTO from(HomeworkCompletion c) {
        return new HomeworkCompletionDTO(c.getStudent().getId(),
                c.getHomework().getId(), c.getCompleted());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/PaymentDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.Payment;
import java.util.UUID;

public record PaymentDTO(UUID studentId, String termKey, Short weekIndex, String status) {
    public static PaymentDTO from(Payment p) {
        return new PaymentDTO(p.getStudent().getId(), p.getTerm().getKey(),
                p.getWeekIndex(), p.getStatus());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/TermWeekDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.TermWeek;

public record TermWeekDTO(Short weekIndex, String label, String dateRange) {
    public static TermWeekDTO from(TermWeek w) {
        return new TermWeekDTO(w.getWeekIndex(), w.getLabel(), w.getDateRange());
    }
}
```

**New file:** `src/main/java/com/markbook/backend/dto/TermDTO.java`

```java
package com.markbook.backend.dto;

import com.markbook.backend.model.Term;
import java.util.List;

public record TermDTO(String key, String label, List<TermWeekDTO> weeks) {
    public static TermDTO from(Term t) {
        return new TermDTO(t.getKey(), t.getLabel(),
                t.getWeeks().stream().map(TermWeekDTO::from).toList());
    }
}
```

#### 5b. Update `ClassOverviewDTO`

**File:** `src/main/java/com/markbook/backend/dto/ClassOverviewDTO.java`

```java
// Before:
public record ClassOverviewDTO(
    Map<String, Object> classInfo,
    List<Map<String, Object>> students,
    List<Map<String, Object>> homework,
    List<Map<String, Object>> attendance,
    List<Map<String, Object>> completions,
    List<Map<String, Object>> payments,
    List<Map<String, Object>> terms
) {}

// After:
public record ClassOverviewDTO(
    ClassDTO classInfo,
    List<StudentDTO> students,
    List<HomeworkDTO> homework,
    List<AttendanceDTO> attendance,
    List<HomeworkCompletionDTO> completions,
    List<PaymentDTO> payments,
    List<TermDTO> terms
) {}
```

#### 5c. Update `ClassService.getClassOverview` to use DTOs

Replace each inline `Map.of(...)` stream in `ClassService` with the new `XxxDTO.from(...)` factory:

```java
// Before (lines 92-94):
List<Map<String, Object>> students = classEntity.getStudents().stream()
        .map(s -> Map.<String, Object>of("id", s.getId(), "name", s.getName()))
        .toList();

// After:
List<StudentDTO> students = classEntity.getStudents().stream()
        .map(StudentDTO::from).toList();
```

Apply the same pattern for `homework`, `attendance`, `completions`, `payments`, and `terms` using the corresponding `XxxDTO.from(...)` call.

Also update the `classInfo` map (lines 84-90) to:
```java
ClassDTO classInfo = ClassDTO.from(classEntity);
```

Then update the constructor call at line 154 to pass the typed lists.

#### 5d. Update all controller return types

**`ClassController.java`:**
- `getClasses`: return type `List<Map<String, Object>>` → `List<ClassDTO>`. Replace the `.map(c -> Map.of(...))` with `.map(ClassDTO::from)`.
- `createClass`: return type `Map<String, Object>` → `ClassDTO`. Replace `return Map.of(...)` with `return ClassDTO.from(created)`.

**`StudentController.java`:**
- `getStudents`: `List<Map<String, Object>>` → `List<StudentDTO>`, use `StudentDTO::from`
- `addStudent`: `Map<String, Object>` → `StudentDTO`, use `StudentDTO.from(student)`

**`HomeworkController.java`:**
- `getHomework`: `List<Map<String, Object>>` → `List<HomeworkDTO>`, use `HomeworkDTO::from`
- `createHomework`: `Map<String, Object>` → `HomeworkDTO`, use `HomeworkDTO.from(homework)`
- `getCompletions`: `List<Map<String, Object>>` → `List<HomeworkCompletionDTO>`, use `HomeworkCompletionDTO::from`
- `toggleCompletion`: `Map<String, Object>` → `HomeworkCompletionDTO`, use `HomeworkCompletionDTO.from(completion)`

**`AttendanceController.java`:**
- `getAttendance`: `List<Map<String, Object>>` → `List<AttendanceDTO>`, use `AttendanceDTO::from`
- `updateAttendance`: `Map<String, Object>` → `AttendanceDTO`, use `AttendanceDTO.from(attendance)`

**`PaymentController.java`:**
- `getPayments`: `List<Map<String, Object>>` → `List<PaymentDTO>`, use `PaymentDTO::from`
- `updatePayment`: `Map<String, Object>` → `PaymentDTO`, use `PaymentDTO.from(payment)`

After all controllers are updated, delete the now-unused `Map`, `HashMap` imports from each controller.

---

### Step 6 — Add Logging to All Services

**Why:** There is zero logging in the entire backend. Diagnosing production issues is guesswork.

#### 6a. Add Lombok to `pom.xml`

```xml
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>
```

> If you prefer not to use Lombok, manually declare `private static final Logger log = LoggerFactory.getLogger(XxxService.class);` in each class and import `org.slf4j.Logger` and `org.slf4j.LoggerFactory`.

#### 6b. Add `@Slf4j` and log statements to each service

For each of the 5 service classes, add `@Slf4j` above the class declaration and add log statements as follows:

**`ClassService.java`:**
```java
@Slf4j
@Service
public class ClassService {
    // In createClass:
    log.info("Creating class for userId={} level={} day={}", userId, classLevel, dayOfWeek);
    // after save:
    log.debug("Class created id={}", classEntity.getId());

    // In deleteClass (after ownership check):
    log.warn("Deleting class id={} by userId={}", id, userId);

    // In getClassOverview:
    log.debug("Loading overview for classId={}", classId);
}
```

**`StudentService.java`:**
```java
// In addStudent:
log.info("Adding student name='{}' to classId={}", name, classId);

// In deleteStudent:
log.warn("Deleting student id={}", id);
```

**`HomeworkService.java`:**
```java
// In createHomework:
log.info("Creating homework title='{}' for classId={} termKey={} weekIndex={}", title, classId, termKey, weekIndex);

// In deleteHomework:
log.warn("Deleting homework id={}", id);

// In toggleCompletion — when creating:
log.debug("Creating new completion for studentId={} homeworkId={}", studentId, homeworkId);
// When toggling:
log.debug("Toggling completion id={} to completed={}", existing.getId(), !existing.getCompleted());
```

**`AttendanceService.java`:**
```java
// In updateAttendance — when creating:
log.debug("Creating attendance for studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex);
// When updating:
log.debug("Updating attendance for studentId={} termKey={} weekIndex={} present={}", studentId, termKey, weekIndex, present);
```

**`PaymentService.java`:**
```java
// In updatePayment — when creating:
log.debug("Creating payment for studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex);
// When updating:
log.info("Updating payment status for studentId={} termKey={} weekIndex={} status={}", studentId, termKey, weekIndex, status);
```

---

### Step 7 — Add `@Transactional` to All Write Methods

**Why:** Write methods that perform multiple DB operations (find + save, or find + delete with cascade) have no transaction boundary. A failure midway can leave partial state committed.

For each method listed below, add `@Transactional` directly above the method:

**`ClassService.java`:**
- `createClass(...)` — currently has no `@Transactional`; involves `userRepository.findById` + conditional `userRepository.save` + `classRepository.save`
- `deleteClass(...)` — involves a `findById` check + `classRepository.delete` + cascaded deletes of students, homework

**`StudentService.java`:**
- `addStudent(...)` — involves `classRepository.findById` + `studentRepository.save`
- `deleteStudent(...)` — involves `studentRepository.findById` + `studentRepository.delete`

**`HomeworkService.java`:**
- `createHomework(...)` — involves two `findById` calls + `homeworkRepository.save`
- `deleteHomework(...)` — simple delete, still good practice
- `toggleCompletion(...)` — involves conditional find + save or find two entities + save; especially important here

**`AttendanceService.java`:**
- `updateAttendance(...)` — involves `findById` (x2) + `attendanceRepository.save`

**`PaymentService.java`:**
- `updatePayment(...)` — involves `findById` (x2) + `paymentRepository.save`

The `@Transactional` import is already present in all service files:
```java
import org.springframework.transaction.annotation.Transactional;
```

---

### Step 8 — Convert Magic Strings to Enums

**Why:** `dayOfWeek` in `ClassEntity` accepts any string; `status` in `Payment` accepts any string. There is no enforcement that these are valid values.

#### 8a. Create enum files

**New file:** `src/main/java/com/markbook/backend/model/enums/DayOfWeek.java`

```java
package com.markbook.backend.model.enums;

public enum DayOfWeek {
    MONDAY, TUESDAY, WEDNESDAY, THURSDAY, FRIDAY, SATURDAY, SUNDAY
}
```

**New file:** `src/main/java/com/markbook/backend/model/enums/PaymentStatus.java`

```java
package com.markbook.backend.model.enums;

public enum PaymentStatus {
    PAID, UNPAID, PENDING
}
```

#### 8b. Update `ClassEntity.java`

Change the `dayOfWeek` field:

```java
// Before:
@Column(name = "day_of_week", length = 20)
private String dayOfWeek;

// After:
@Enumerated(EnumType.STRING)
@Column(name = "day_of_week", length = 20)
private DayOfWeek dayOfWeek;
```

Update the getter/setter types from `String` to `DayOfWeek`. Add import:
```java
import com.markbook.backend.model.enums.DayOfWeek;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
```

> **DB migration required:** The `day_of_week` column in the `classes` table currently stores lowercase values (e.g., `"monday"`). The enum names are uppercase. Before applying this code change, run the following SQL against Neon:
> ```sql
> UPDATE classes SET day_of_week = UPPER(day_of_week);
> ```

#### 8c. Update `Payment.java`

```java
// Before:
@Column(name = "status", length = 15, columnDefinition = "varchar(15) default 'unpaid'")
private String status;

// After:
@Enumerated(EnumType.STRING)
@Column(name = "status", length = 15)
private PaymentStatus status;
```

Update getter/setter types. Add import:
```java
import com.markbook.backend.model.enums.PaymentStatus;
```

> **DB migration required:** The `status` column stores lowercase values (`"paid"`, `"unpaid"`, `"pending"`). Before applying the code change:
> ```sql
> UPDATE payments SET status = UPPER(status);
> ```

#### 8d. Update `ClassDTO.from()` and `PaymentDTO.from()`

`ClassDTO.from()` maps `c.getDayOfWeek()` — after the entity change, this now returns `DayOfWeek` instead of `String`. Either:
- Call `.name()` to get the string: `c.getDayOfWeek().name()`
- Or change `ClassDTO.dayOfWeek` field type to `DayOfWeek` (preferred for type safety)

Do the same for `PaymentDTO.status` / `PaymentService.updatePayment` — the service currently receives `String status` from the controller. After the enum change, update `PaymentService.updatePayment` to accept `PaymentStatus status`, and update `UpdatePaymentRequest.status` from `String` to `PaymentStatus` (Jackson will deserialize the string automatically).

#### 8e. Update `ClassService.createClass` signature

```java
// Before:
public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, ...)

// After:
public ClassEntity createClass(String userId, String classLevel, DayOfWeek dayOfWeek, ...)
```

Update the call in `ClassController.createClass` to pass `DayOfWeek.valueOf(body.dayOfWeek().toUpperCase())`, or if `CreateClassRequest.dayOfWeek` is changed to type `DayOfWeek`, Jackson handles the deserialization.

---

### Step 9 — Remove Unused Repository Methods

**Why:** Each repository has both an unused auto-generated method and a better custom JOIN FETCH method. The unused methods are dead code and dangerous — if called by mistake, they bypass JOIN FETCH and trigger N+1 queries.

For each repository, **delete** the method listed under "Remove":

**`AttendanceRepository.java`:**
- Remove: `List<Attendance> findByStudentClassEntityId(UUID classId);`
- Keep: `findByStudentIdAndTermKeyAndWeekIndex(...)` (used in upsert)
- Keep: `findByClassIdWithFetch(...)` (used in list endpoint)

**`HomeworkRepository.java`:**
- Remove: `List<Homework> findByClassEntityId(UUID classId);`
- Keep: `findByClassEntityIdAndTermKeyAndWeekIndex(...)` (used in filtered query)
- Keep: `findByClassIdWithFetch(...)` (used in list endpoint)

**`HomeworkCompletionRepository.java`:**
- Remove: `List<HomeworkCompletion> findByHomeworkClassEntityId(UUID classId);`
- Keep: `findByStudentIdAndHomeworkId(...)` (used in toggle)
- Keep: `findByClassIdWithFetch(...)` (used in list endpoint)

**`PaymentRepository.java`:**
- Remove: `List<Payment> findByStudentClassEntityId(UUID classId);`
- Keep: `findByStudentIdAndTermKeyAndWeekIndex(...)` (used in upsert)
- Keep: `findByClassIdWithFetch(...)` (used in list endpoint)

**`TermRepository.java`:**
- Remove: `List<Term> findAllByOrderBySortOrderAsc();`
- Keep: `findAllWithWeeks()` (used in `TermService` and `ClassService`)

After removing, do a project-wide search for each deleted method name to confirm nothing still calls it.

---

## Tier 3 — Technical Debt

---

### Step 10 — Make CORS Origins Configurable

**Why:** `CorsConfig` hardcodes `http://localhost:5173`. Deploying the frontend to any other host breaks all API calls.

**File:** `src/main/java/com/markbook/backend/config/CorsConfig.java`

```java
// Before:
registry.addMapping("/api/**")
        .allowedOrigins("http://localhost:3000", "http://localhost:5173")
        ...

// After:
@Value("${cors.allowed-origins:http://localhost:5173,http://localhost:3000}")
private String[] allowedOrigins;

// Then in addCorsMappings:
registry.addMapping("/api/**")
        .allowedOrigins(allowedOrigins)
        ...
```

Add import:
```java
import org.springframework.beans.factory.annotation.Value;
```

Add to `application.properties`:
```properties
cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}
```

In production, set the `CORS_ALLOWED_ORIGINS` environment variable to the deployed frontend URL.

---

### Step 11 — Simplify `ClassService.getClassOverview`

**Why:** `getClassOverview` fires 5 parallel `CompletableFuture` queries. This is hard to test, has no timeout, and uses Spring's default thread pool in a way that can cause contention. Neon is fast; sequential queries are simpler and still well under 100ms for typical data sizes.

**`ClassService.java`** — replace lines 96-152 with sequential calls:

```java
@Transactional(readOnly = true)
public ClassOverviewDTO getClassOverview(UUID classId, String userId) {
    ClassEntity classEntity = classRepository.findByIdWithStudents(classId)
            .orElseThrow(() -> new ResourceNotFoundException("Class not found"));

    if (!classEntity.getUser().getId().equals(userId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
    }

    ClassDTO classInfo = ClassDTO.from(classEntity);
    List<StudentDTO> students = classEntity.getStudents().stream().map(StudentDTO::from).toList();

    List<HomeworkDTO> homework = homeworkRepository.findByClassIdWithFetch(classId)
            .stream().map(HomeworkDTO::from).toList();
    List<AttendanceDTO> attendance = attendanceRepository.findByClassIdWithFetch(classId)
            .stream().map(AttendanceDTO::from).toList();
    List<HomeworkCompletionDTO> completions = completionRepository.findByClassIdWithFetch(classId)
            .stream().map(HomeworkCompletionDTO::from).toList();
    List<PaymentDTO> payments = paymentRepository.findByClassIdWithFetch(classId)
            .stream().map(PaymentDTO::from).toList();
    List<TermDTO> terms = termRepository.findAllWithWeeks()
            .stream().map(TermDTO::from).toList();

    return new ClassOverviewDTO(classInfo, students, homework, attendance, completions, payments, terms);
}
```

Remove the now-unused imports from `ClassService`:
```java
// Remove:
import java.util.concurrent.CompletableFuture;
import java.util.HashMap;
import java.util.Map;
```

---

### Step 12 — Add Caching for Terms

**Why:** `termRepository.findAllWithWeeks()` is called on every `GET /api/terms` and on every `GET /api/classes/{id}/overview`. Terms are static reference data that never change at runtime.

#### 12a. Enable caching in `BackendApplication.java`

```java
// Before:
@SpringBootApplication
public class BackendApplication { ... }

// After:
@SpringBootApplication
@EnableCaching
public class BackendApplication { ... }
```

Add import:
```java
import org.springframework.cache.annotation.EnableCaching;
```

#### 12b. Add `@Cacheable` to `TermService.getAllTerms`

**`TermService.java`:**

```java
// Before:
@Transactional(readOnly = true)
public List<Term> getAllTerms() {
    return termRepository.findAllWithWeeks();
}

// After:
@Cacheable("terms")
@Transactional(readOnly = true)
public List<Term> getAllTerms() {
    return termRepository.findAllWithWeeks();
}
```

Add import:
```java
import org.springframework.cache.annotation.Cacheable;
```

Spring Boot auto-configures a `ConcurrentMapCacheManager` by default (no extra dependency needed for a simple in-memory cache). If you later add Redis, just swap in the Redis cache starter and the `@Cacheable` annotation continues to work.

> **Note:** `ClassService` calls `termRepository.findAllWithWeeks()` directly, bypassing `TermService`. After this step, either route that call through `TermService.getAllTerms()` to benefit from the cache, or add `@Cacheable("terms")` to the repository method itself using a Spring Cache proxy.

---

### Step 13 — Add Swagger / OpenAPI Documentation

**Why:** There is no API documentation. Every endpoint's request/response shape must be inferred from the source code.

#### 13a. Add `springdoc-openapi` dependency to `pom.xml`

```xml
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-starter-webmvc-ui</artifactId>
    <version>2.3.0</version>
</dependency>
```

After adding this, Swagger UI is available at `http://localhost:8080/swagger-ui.html` with zero additional configuration. All endpoints and their DTOs are auto-detected.

#### 13b. Add descriptions to controllers (optional but useful)

```java
// Example on ClassController:
@Tag(name = "Classes", description = "Manage tutoring classes")
@RestController
@RequestMapping("/api/classes")
public class ClassController { ... }
```

```java
// Example on an endpoint:
@Operation(summary = "Get all classes for the authenticated user")
@GetMapping
public List<ClassDTO> getClasses(...) { ... }
```

Add import:
```java
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
```

---

### Step 14 — Add Tests

**Why:** The codebase has zero tests. Regressions are only caught in production.

#### 14a. Unit tests for service logic

Create `src/test/java/com/markbook/backend/service/ClassServiceTest.java`:

```java
@ExtendWith(MockitoExtension.class)
class ClassServiceTest {

    @Mock ClassRepository classRepository;
    @Mock UserRepository userRepository;
    // ... other mocks

    @InjectMocks ClassService classService;

    @Test
    void createClass_autoCreatesUser_whenUserNotFound() {
        when(userRepository.findById("new@email.com")).thenReturn(Optional.empty());
        when(userRepository.save(any())).thenReturn(new User("new@email.com", "new@email.com", "new@email.com"));
        when(classRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        ClassEntity result = classService.createClass("new@email.com", "Year 10", DayOfWeek.MONDAY,
                LocalTime.of(9, 0), LocalTime.of(10, 0));

        verify(userRepository).save(any(User.class));
        assertNotNull(result);
    }

    @Test
    void deleteClass_throwsForbidden_whenWrongUser() {
        ClassEntity cls = new ClassEntity();
        User owner = new User("owner@email.com", "owner", "owner@email.com");
        cls.setUser(owner);
        when(classRepository.findById(any())).thenReturn(Optional.of(cls));

        assertThrows(ResponseStatusException.class,
                () -> classService.deleteClass(UUID.randomUUID(), "other@email.com"));
    }
}
```

#### 14b. Controller integration tests with MockMvc

Create `src/test/java/com/markbook/backend/controller/ClassControllerTest.java`:

```java
@WebMvcTest(ClassController.class)
class ClassControllerTest {

    @Autowired MockMvc mockMvc;
    @MockBean ClassService classService;

    @Test
    void getClasses_returns200_withValidUserId() throws Exception {
        when(classService.getClassesForUser("user@email.com")).thenReturn(List.of());

        mockMvc.perform(get("/api/classes").header("X-User-Id", "user@email.com"))
                .andExpect(status().isOk())
                .andExpect(content().json("[]"));
    }

    @Test
    void createClass_returns400_whenBodyInvalid() throws Exception {
        mockMvc.perform(post("/api/classes")
                        .header("X-User-Id", "user@email.com")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }
}
```

#### 14c. Repository tests with `@DataJpaTest`

Create `src/test/java/com/markbook/backend/repository/AttendanceRepositoryTest.java`:

```java
@DataJpaTest
class AttendanceRepositoryTest {

    @Autowired AttendanceRepository attendanceRepository;

    @Test
    void findByClassIdWithFetch_returnsCorrectRecords() {
        // set up test data, call repository, assert
    }
}
```

> `@DataJpaTest` uses an H2 in-memory database by default. Since the app uses PostgreSQL-specific features (like `sslmode`), you may need to add `@AutoConfigureTestDatabase(replace = NONE)` and use Testcontainers with a real PostgreSQL instance for integration tests.

---

## File Change Summary

| File | Action | Steps |
|---|---|---|
| `exception/ResourceNotFoundException.java` | Create | 1a |
| `exception/GlobalExceptionHandler.java` | Create | 1b |
| `service/ClassService.java` | Edit | 1c, 4b, 7, 11 |
| `service/StudentService.java` | Edit | 1c, 4c, 7 |
| `service/HomeworkService.java` | Edit | 1c, 7 |
| `service/AttendanceService.java` | Edit | 1c, 7 |
| `service/PaymentService.java` | Edit | 1c, 7 |
| `pom.xml` | Edit | 2a, 6a, 13a |
| `dto/request/CreateClassRequest.java` | Create | 2b |
| `dto/request/CreateStudentRequest.java` | Create | 2b |
| `dto/request/CreateHomeworkRequest.java` | Create | 2b |
| `dto/request/UpdateAttendanceRequest.java` | Create | 2b |
| `dto/request/UpdatePaymentRequest.java` | Create | 2b |
| `dto/request/ToggleCompletionRequest.java` | Create | 2b |
| `controller/ClassController.java` | Edit | 2c, 4a, 4b, 5d |
| `controller/StudentController.java` | Edit | 2c, 4c, 5d |
| `controller/HomeworkController.java` | Edit | 2c, 5d |
| `controller/AttendanceController.java` | Edit | 2c, 5d |
| `controller/PaymentController.java` | Edit | 2c, 5d |
| `resources/application.properties` | Edit | 3a, 10 |
| `resources/application-local.properties` | Create | 3b |
| `.gitignore` | Edit | 3c |
| `dto/ClassDTO.java` | Create | 5a |
| `dto/StudentDTO.java` | Create | 5a |
| `dto/HomeworkDTO.java` | Create | 5a |
| `dto/AttendanceDTO.java` | Create | 5a |
| `dto/HomeworkCompletionDTO.java` | Create | 5a |
| `dto/PaymentDTO.java` | Create | 5a |
| `dto/TermWeekDTO.java` | Create | 5a |
| `dto/TermDTO.java` | Create | 5a |
| `dto/ClassOverviewDTO.java` | Edit | 5b |
| `model/enums/DayOfWeek.java` | Create | 8a |
| `model/enums/PaymentStatus.java` | Create | 8a |
| `model/ClassEntity.java` | Edit | 8b |
| `model/Payment.java` | Edit | 8c |
| `repository/AttendanceRepository.java` | Edit | 9 |
| `repository/HomeworkRepository.java` | Edit | 9 |
| `repository/HomeworkCompletionRepository.java` | Edit | 9 |
| `repository/PaymentRepository.java` | Edit | 9 |
| `repository/TermRepository.java` | Edit | 9 |
| `config/CorsConfig.java` | Edit | 10 |
| `BackendApplication.java` | Edit | 12a |
| `service/TermService.java` | Edit | 12b |
| `service/*Test.java` | Create | 14a |
| `controller/*Test.java` | Create | 14b |
| `repository/*Test.java` | Create | 14c |

---

## SQL Migrations Required Before Deploying Steps 8b/8c

These must be run against the Neon database **before** deploying the enum changes. The app uses `ddl-auto=validate` so no schema changes happen automatically.

```sql
-- Step 8b: Uppercase day_of_week values in classes table
UPDATE classes SET day_of_week = UPPER(day_of_week);

-- Step 8c: Uppercase status values in payments table
UPDATE payments SET status = UPPER(status);
```

Verify before running:
```sql
SELECT DISTINCT day_of_week FROM classes;
SELECT DISTINCT status FROM payments;
```
