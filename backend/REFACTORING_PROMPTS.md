# Backend Refactoring — Sequential Prompts for Claude Code

Each prompt below is a self-contained instruction to be sent to Claude Code **one at a time**, in order.
Do not skip prompts. Do not combine prompts. After each prompt that creates or modifies Java files, a
`mvn compile` check is included to confirm all imports resolve before continuing.

---

## PROMPT 1 — Exception Infrastructure

```
You are implementing Step 1 of the backend refactoring plan for the Spring Boot project at
backend/src/main/java/com/markbook/backend.

Do the following, in this exact order:

1. Create the directory backend/src/main/java/com/markbook/backend/exception/ if it does not exist.

2. Create ResourceNotFoundException.java in that directory. It must:
   - Be in package com.markbook.backend.exception
   - Extend RuntimeException
   - Have a single constructor that takes a String message and passes it to super()

3. Create GlobalExceptionHandler.java in that same exception/ directory. It must:
   - Be in package com.markbook.backend.exception
   - Be annotated with @RestControllerAdvice
   - Have four @ExceptionHandler methods:
     a. handleNotFound(ResourceNotFoundException ex) → HTTP 404, body Map.of("error", ex.getMessage())
     b. handleBadRequest(IllegalArgumentException ex) → HTTP 400, body Map.of("error", ex.getMessage())
     c. handleValidation(MethodArgumentNotValidException ex) → HTTP 400, body with all field errors joined
        by ", " in format "fieldName: message"
     d. handleGeneric(Exception ex) → HTTP 500, body Map.of("error", "An unexpected error occurred")

4. In each of the following service files, replace every throw new RuntimeException(...) with
   throw new ResourceNotFoundException(...) using the same message string. Add the import
   com.markbook.backend.exception.ResourceNotFoundException to each file.
   - ClassService.java: two occurrences (lines 54 and 82, both say "Class not found")
   - StudentService.java: one occurrence (line 31, "Class not found")
   - HomeworkService.java: four occurrences (lines 43, 45, 73, 75)
   - AttendanceService.java: two occurrences (lines 43, 45)
   - PaymentService.java: two occurrences (lines 43, 45)

5. After all edits are complete, run: cd backend && mvn compile
   Report the full output. If compilation fails, diagnose and fix the error before stopping.

Do not modify anything else.
```

---

## PROMPT 2 — Input Validation: Dependency + Request Records

```
You are implementing Step 2a and 2b of the backend refactoring plan.
Read the current pom.xml and all existing controller files before making any changes.

Do the following, in this exact order:

1. Open backend/pom.xml. Inside the <dependencies> block, add the Spring Boot validation starter:
   groupId: org.springframework.boot
   artifactId: spring-boot-starter-validation
   No version needed (managed by Spring Boot BOM).

2. Create the directory backend/src/main/java/com/markbook/backend/dto/request/

3. Create the following six Java record files in that directory. Each must be in package
   com.markbook.backend.dto.request and use jakarta.validation annotations:

   a. CreateClassRequest.java
      Fields: String classLevel (@NotBlank), String dayOfWeek (@NotBlank),
              String startTime (@NotNull), String endTime (@NotNull)

   b. CreateStudentRequest.java
      Fields: String name (@NotBlank, @Size max=100)

   c. CreateHomeworkRequest.java
      Fields: String title (@NotBlank, @Size max=100), String termKey (@NotBlank),
              Short weekIndex (@NotNull)

   d. UpdateAttendanceRequest.java
      Fields: UUID studentId (@NotNull), String termKey (@NotNull),
              Short weekIndex (@NotNull), Boolean present (@NotNull)

   e. UpdatePaymentRequest.java
      Fields: UUID studentId (@NotNull), String termKey (@NotNull),
              Short weekIndex (@NotNull), String status (@NotBlank)

   f. ToggleCompletionRequest.java
      Fields: UUID studentId (@NotNull), UUID homeworkId (@NotNull)

4. Run: cd backend && mvn compile
   Report the full output. Fix any errors before stopping.

Do not touch any controller or service files yet.
```

---

## PROMPT 3 — Input Validation: Wire Request Records into Controllers

```
You are implementing Step 2c of the backend refactoring plan.
Read each controller file in full before editing it.

Update the following five controllers to use the new request record types. For each controller:
- Replace the @RequestBody Map<...> parameter with @RequestBody @Valid <RequestRecord> body
- Update all body.get("field") and (Type) body.get("field") accesses to use record accessor methods (body.field())
- Remove the explicit ((Number) ...).shortValue() casts — the record already declares the field as Short
- Add imports for the request record and jakarta.validation.Valid

The specific changes per controller:

1. ClassController.java — createClass method:
   Replace @RequestBody Map<String, String> body with @RequestBody @Valid CreateClassRequest body
   Update: body.get("classLevel") → body.classLevel(), body.get("dayOfWeek") → body.dayOfWeek(),
           LocalTime.parse(body.get("startTime")) → LocalTime.parse(body.startTime()),
           LocalTime.parse(body.get("endTime")) → LocalTime.parse(body.endTime())

2. StudentController.java — addStudent method:
   Replace @RequestBody Map<String, String> body with @RequestBody @Valid CreateStudentRequest body
   Update: body.get("name") → body.name()

3. HomeworkController.java — createHomework method:
   Replace @RequestBody Map<String, Object> body with @RequestBody @Valid CreateHomeworkRequest body
   Update: (String) body.get("title") → body.title(), (String) body.get("termKey") → body.termKey(),
           ((Number) body.get("weekIndex")).shortValue() → body.weekIndex()

   HomeworkController.java — toggleCompletion method:
   Replace @RequestBody Map<String, String> body with @RequestBody @Valid ToggleCompletionRequest body
   Update: UUID.fromString(body.get("studentId")) → body.studentId(),
           UUID.fromString(body.get("homeworkId")) → body.homeworkId()

4. AttendanceController.java — updateAttendance method:
   Replace @RequestBody Map<String, Object> body with @RequestBody @Valid UpdateAttendanceRequest body
   Update: UUID.fromString((String) body.get("studentId")) → body.studentId(),
           (String) body.get("termKey") → body.termKey(),
           ((Number) body.get("weekIndex")).shortValue() → body.weekIndex(),
           (Boolean) body.get("present") → body.present()

5. PaymentController.java — updatePayment method:
   Replace @RequestBody Map<String, Object> body with @RequestBody @Valid UpdatePaymentRequest body
   Update: UUID.fromString((String) body.get("studentId")) → body.studentId(),
           (String) body.get("termKey") → body.termKey(),
           ((Number) body.get("weekIndex")).shortValue() → body.weekIndex(),
           (String) body.get("status") → body.status()

After all five controllers are updated, run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 4 — Credentials to Environment Variables

```
You are implementing Step 3 of the backend refactoring plan.
Read backend/src/main/resources/application.properties in full before editing.

Do the following:

1. In application.properties, find the three hardcoded lines for:
   spring.datasource.url, spring.datasource.username, spring.datasource.password
   Replace the hardcoded values with environment variable references:
   spring.datasource.url=${DATABASE_URL}
   spring.datasource.username=${DATABASE_USERNAME}
   spring.datasource.password=${DATABASE_PASSWORD}
   Do not change any other property.

2. Create backend/src/main/resources/application-local.properties with the three original
   hardcoded values you just removed, formatted as:
   DATABASE_URL=<the original jdbc url>
   DATABASE_USERNAME=<the original username>
   DATABASE_PASSWORD=<the original password>

3. Read the root .gitignore file. If the line
   backend/src/main/resources/application-local.properties
   is not already present, add it.

4. Run: cd backend && mvn compile
   Report the full output. Fix any errors before stopping.

Note: To run the app locally after this change, either set the environment variables
DATABASE_URL, DATABASE_USERNAME, DATABASE_PASSWORD in your shell, or activate the local
Spring profile with -Dspring.profiles.active=local so it loads application-local.properties.
```

---

## PROMPT 5 — Authorization Checks

```
You are implementing Step 4 of the backend refactoring plan.
Read ClassController.java, ClassService.java, StudentController.java, and StudentService.java
in full before editing.

Do the following, in this exact order:

1. ClassController.java — deleteClass method:
   Add @RequestHeader("X-User-Id") String userId as a second parameter.
   Update the classService.deleteClass(id) call to classService.deleteClass(id, userId).

2. ClassService.java — deleteClass method:
   Change the signature from deleteClass(UUID id) to deleteClass(UUID id, String userId).
   Add @Transactional annotation to this method.
   Inside the method, replace the direct classRepository.deleteById(id) call with:
   - Fetch the class with classRepository.findById(id), throw ResourceNotFoundException("Class not found") if absent
   - Check cls.getUser().getId().equals(userId); if false, throw ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied")
   - Call classRepository.delete(cls)
   Add imports: org.springframework.http.HttpStatus, org.springframework.web.server.ResponseStatusException

3. ClassController.java — getClassOverview method:
   Add @RequestHeader("X-User-Id") String userId as a second parameter.
   Update the classService.getClassOverview(id) call to classService.getClassOverview(id, userId).

4. ClassService.java — getClassOverview method:
   Change the signature from getClassOverview(UUID classId) to getClassOverview(UUID classId, String userId).
   Immediately after fetching classEntity (the findByIdWithStudents call), add:
   if (!classEntity.getUser().getId().equals(userId)), throw ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied").

5. StudentController.java — deleteStudent method:
   Add @RequestHeader("X-User-Id") String userId as a second parameter.
   Update the call to studentService.deleteStudent(id, userId).

6. StudentService.java — deleteStudent method:
   Change the signature from deleteStudent(UUID id) to deleteStudent(UUID id, String userId).
   Add @Transactional annotation.
   Replace studentRepository.deleteById(id) with:
   - Fetch with studentRepository.findById(id), throw ResourceNotFoundException("Student not found") if absent
   - Check student.getClassEntity().getUser().getId().equals(userId); if false throw ResponseStatusException FORBIDDEN
   - Call studentRepository.delete(student)
   Add the same ResponseStatusException and HttpStatus imports.

7. Run: cd backend && mvn compile
   Report the full output. Fix any errors before stopping.
```

---

## PROMPT 6 — Response DTOs: Create All DTO Records

```
You are implementing Step 5a and 5b of the backend refactoring plan.
Do not touch any service or controller files in this prompt.

Create the following eight Java record files in backend/src/main/java/com/markbook/backend/dto/
All must be in package com.markbook.backend.dto.
Each must have a static factory method named from() that takes the corresponding entity and returns a new DTO instance.

1. ClassDTO.java
   Fields: UUID id, String classLevel, String dayOfWeek, String startTime, String endTime, String name
   from(ClassEntity c): maps c.getId(), c.getClassLevel(), c.getDayOfWeek(), c.getStartTime().toString(),
   c.getEndTime().toString(), c.getName()

2. StudentDTO.java
   Fields: UUID id, String name
   from(Student s): maps s.getId(), s.getName()

3. HomeworkDTO.java
   Fields: UUID id, String title, String termKey, Short weekIndex
   from(Homework h): maps h.getId(), h.getTitle(), h.getTerm().getKey(), h.getWeekIndex()

4. AttendanceDTO.java
   Fields: UUID studentId, String termKey, Short weekIndex, Boolean present
   from(Attendance a): maps a.getStudent().getId(), a.getTerm().getKey(), a.getWeekIndex(), a.getPresent()

5. HomeworkCompletionDTO.java
   Fields: UUID studentId, UUID homeworkId, Boolean completed
   from(HomeworkCompletion c): maps c.getStudent().getId(), c.getHomework().getId(), c.getCompleted()

6. PaymentDTO.java
   Fields: UUID studentId, String termKey, Short weekIndex, String status
   from(Payment p): maps p.getStudent().getId(), p.getTerm().getKey(), p.getWeekIndex(), p.getStatus()

7. TermWeekDTO.java
   Fields: Short weekIndex, String label, String dateRange
   from(TermWeek w): maps w.getWeekIndex(), w.getLabel(), w.getDateRange()

8. TermDTO.java
   Fields: String key, String label, List<TermWeekDTO> weeks
   from(Term t): maps t.getKey(), t.getLabel(), then maps t.getWeeks() stream using TermWeekDTO::from

Then update the existing ClassOverviewDTO.java record:
Replace every Map<String, Object> field type with the corresponding typed DTO list:
- classInfo: Map<String, Object> → ClassDTO
- students: List<Map<String, Object>> → List<StudentDTO>
- homework: List<Map<String, Object>> → List<HomeworkDTO>
- attendance: List<Map<String, Object>> → List<AttendanceDTO>
- completions: List<Map<String, Object>> → List<HomeworkCompletionDTO>
- payments: List<Map<String, Object>> → List<PaymentDTO>
- terms: List<Map<String, Object>> → List<TermDTO>
Add all necessary imports.

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 7 — Response DTOs: Update ClassService and All Controllers

```
You are implementing Step 5c and 5d of the backend refactoring plan.
Read ClassService.java and every controller file in full before editing.

Part A — ClassService.java, getClassOverview method:
Replace the entire inline map-building block (the HashMap and all the Map.of stream mappings)
with typed DTO calls:
- Replace the classInfo HashMap block with: ClassDTO classInfo = ClassDTO.from(classEntity);
- Replace each Map.of stream with the corresponding DTO factory:
  students → .map(StudentDTO::from).toList()
  homework → .map(HomeworkDTO::from).toList()
  attendance → .map(AttendanceDTO::from).toList()
  completions → .map(HomeworkCompletionDTO::from).toList()
  payments → .map(PaymentDTO::from).toList()
  terms → .map(TermDTO::from).toList()
- Update the ClassOverviewDTO constructor call to use the new typed variables.
- Remove the now-unused imports: java.util.HashMap, java.util.Map (if no longer used elsewhere in the file).
  Keep java.util.List and java.util.UUID.
- Add imports for all new DTO classes.

Part B — Update each controller to use typed return types:

ClassController.java:
- getClasses: change return type from List<Map<String, Object>> to List<ClassDTO>,
  replace .map(c -> Map.of(...)) with .map(ClassDTO::from)
- createClass: change return type from Map<String, Object> to ClassDTO,
  replace return Map.of(...) with return ClassDTO.from(created)
- Remove Map import if no longer used.

StudentController.java:
- getStudents: List<Map<String, Object>> → List<StudentDTO>, use StudentDTO::from
- addStudent: Map<String, Object> → StudentDTO, use StudentDTO.from(student)
- Remove Map import if no longer used.

HomeworkController.java:
- getHomework: List<Map<String, Object>> → List<HomeworkDTO>, use HomeworkDTO::from
- createHomework: Map<String, Object> → HomeworkDTO, use HomeworkDTO.from(homework)
- getCompletions: List<Map<String, Object>> → List<HomeworkCompletionDTO>, use HomeworkCompletionDTO::from
- toggleCompletion: Map<String, Object> → HomeworkCompletionDTO, use HomeworkCompletionDTO.from(completion)
- Remove Map import if no longer used.

AttendanceController.java:
- getAttendance: List<Map<String, Object>> → List<AttendanceDTO>, use AttendanceDTO::from
- updateAttendance: Map<String, Object> → AttendanceDTO, use AttendanceDTO.from(attendance)
- Remove Attendance entity import and Map import if no longer used.

PaymentController.java:
- getPayments: List<Map<String, Object>> → List<PaymentDTO>, use PaymentDTO::from
- updatePayment: Map<String, Object> → PaymentDTO, use PaymentDTO.from(payment)
- Remove Payment entity import and Map import if no longer used.

After all edits, run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 8 — Add Logging to All Services

```
You are implementing Step 6 of the backend refactoring plan.
Read pom.xml and each service file before editing.

Part A — Add Lombok to pom.xml:
Inside the <dependencies> block, add:
groupId: org.projectlombok, artifactId: lombok, with <optional>true</optional>.
No version needed.

Part B — Add @Slf4j and log statements to each service:
For each service file, add the @Slf4j annotation directly above the @Service annotation,
and add the import lombok.extern.slf4j.Slf4j.
Then add log statements as described below. Use the exact log levels specified.

ClassService.java:
- createClass: log.info at the start: "Creating class for userId={} level={} day={}", userId, classLevel, dayOfWeek
  log.debug after save: "Class created id={}", classEntity.getId()
- deleteClass: log.warn after the ownership check passes: "Deleting class id={} by userId={}", id, userId
- getClassOverview: log.debug at the start: "Loading overview for classId={}", classId

StudentService.java:
- addStudent: log.info at the start: "Adding student name='{}' to classId={}", name, classId
- deleteStudent: log.warn after the ownership check passes: "Deleting student id={}", id

HomeworkService.java:
- createHomework: log.info at the start: "Creating homework title='{}' for classId={} termKey={} weekIndex={}", title, classId, termKey, weekIndex
- deleteHomework: log.warn at the start: "Deleting homework id={}", id
- toggleCompletion — inside the orElseGet block (new record path): log.debug "Creating new completion for studentId={} homeworkId={}", studentId, homeworkId
- toggleCompletion — inside the map block (existing record path): log.debug "Toggling completion for studentId={} homeworkId={} to completed={}", studentId, homeworkId, !existing.getCompleted()

AttendanceService.java:
- updateAttendance — inside map block (update path): log.debug "Updating attendance studentId={} termKey={} weekIndex={} present={}", studentId, termKey, weekIndex, present
- updateAttendance — inside orElseGet block (create path): log.debug "Creating attendance studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex

PaymentService.java:
- updatePayment — inside map block (update path): log.info "Updating payment status studentId={} termKey={} weekIndex={} status={}", studentId, termKey, weekIndex, status
- updatePayment — inside orElseGet block (create path): log.debug "Creating payment studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 9 — Add @Transactional to All Write Methods

```
You are implementing Step 7 of the backend refactoring plan.
Read each service file before editing. The import org.springframework.transaction.annotation.Transactional
is already present in all service files — do not add a duplicate.

Add @Transactional (with no attributes) directly above each of the following methods.
Do not add it to methods that already have @Transactional(readOnly = true).

ClassService.java:
- createClass(...)

StudentService.java:
- addStudent(...)
(deleteStudent already has @Transactional from the auth check step — verify it is there, add if missing)

HomeworkService.java:
- createHomework(...)
- deleteHomework(...)
- toggleCompletion(...)

AttendanceService.java:
- updateAttendance(...)

PaymentService.java:
- updatePayment(...)

After all edits, run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 10 — Remove Unused Repository Methods

```
You are implementing Step 9 of the backend refactoring plan.
Read each repository file before editing.

Delete exactly the following method declarations from each repository interface.
Do not remove any other methods.

AttendanceRepository.java:
  Remove: List<Attendance> findByStudentClassEntityId(UUID classId);

HomeworkRepository.java:
  Remove: List<Homework> findByClassEntityId(UUID classId);

HomeworkCompletionRepository.java:
  Remove: List<HomeworkCompletion> findByHomeworkClassEntityId(UUID classId);

PaymentRepository.java:
  Remove: List<Payment> findByStudentClassEntityId(UUID classId);

TermRepository.java:
  Remove: List<Term> findAllByOrderBySortOrderAsc();

After removing each method, do a project-wide text search for that method name to confirm
no other file in the project still calls it. If any caller is found, report it and do not
delete that method until the caller is updated.

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 11 — Configurable CORS Origins

```
You are implementing Step 10 of the backend refactoring plan.
Read CorsConfig.java and application.properties in full before editing.

1. In CorsConfig.java:
   - Add a field: @Value("${cors.allowed-origins}") private String[] allowedOrigins;
   - Add import: org.springframework.beans.factory.annotation.Value
   - In the addCorsMappings method, replace the hardcoded array in .allowedOrigins(...)
     with the injected field: .allowedOrigins(allowedOrigins)
   - Do not change any other CORS settings.

2. In application.properties, add this line at the end:
   cors.allowed-origins=${CORS_ALLOWED_ORIGINS:http://localhost:5173,http://localhost:3000}

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 12 — Simplify ClassService: Remove CompletableFuture

```
You are implementing Step 11 of the backend refactoring plan.
Read ClassService.java in full before editing.

In ClassService.java, replace the entire body of the getClassOverview method
with sequential repository calls. The replacement must:

1. Keep the same method signature and @Transactional(readOnly = true) annotation.
2. Fetch classEntity using classRepository.findByIdWithStudents(classId),
   throw ResourceNotFoundException("Class not found") if absent.
3. Perform the userId ownership check (already added in Prompt 5).
4. Call each repository method directly and sequentially (no CompletableFuture):
   homeworkRepository.findByClassIdWithFetch(classId)
   attendanceRepository.findByClassIdWithFetch(classId)
   completionRepository.findByClassIdWithFetch(classId)
   paymentRepository.findByClassIdWithFetch(classId)
   termRepository.findAllWithWeeks()
5. Map each result to its typed DTO list using the from() factory methods
   (already established in Prompt 7).
6. Construct and return the ClassOverviewDTO with all typed lists.

After replacing the method body, remove the now-unused import:
  java.util.concurrent.CompletableFuture

Keep all other imports intact.

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 13 — Enable Caching for Terms

```
You are implementing Step 12 of the backend refactoring plan.
Read BackendApplication.java and TermService.java before editing.

1. BackendApplication.java:
   Add @EnableCaching annotation directly above @SpringBootApplication.
   Add import: org.springframework.cache.annotation.EnableCaching

2. TermService.java:
   Add @Cacheable("terms") directly above the @Transactional(readOnly = true) annotation
   on the getAllTerms() method.
   Add import: org.springframework.cache.annotation.Cacheable

3. ClassService.java:
   Find the direct call to termRepository.findAllWithWeeks() inside getClassOverview.
   The TermService is not currently injected into ClassService. Inject it:
   - Add a private final TermService termService field
   - Add TermService termService to the constructor parameter list and assign it
   - Replace termRepository.findAllWithWeeks() with termService.getAllTerms()
   - Add import: com.markbook.backend.service.TermService
   Do not remove termRepository from ClassService yet — verify it is still used elsewhere
   in the class first. If termRepository is now unused after this change, remove it from
   the field list and constructor.

Run: cd backend && mvn compile
Report the full output. Fix any errors before stopping.
```

---

## PROMPT 14 — Deep Review

```
You are performing a final deep review of the backend refactoring that was carried out across
the previous 13 prompts. Your job is to verify correctness, completeness, and consistency.
Do not make any changes unless you find a concrete defect. If you find a defect, fix it and
describe what you fixed.

Read every file that was created or modified during the refactoring:

exception/ResourceNotFoundException.java
exception/GlobalExceptionHandler.java
dto/request/CreateClassRequest.java
dto/request/CreateStudentRequest.java
dto/request/CreateHomeworkRequest.java
dto/request/UpdateAttendanceRequest.java
dto/request/UpdatePaymentRequest.java
dto/request/ToggleCompletionRequest.java
dto/ClassDTO.java
dto/StudentDTO.java
dto/HomeworkDTO.java
dto/AttendanceDTO.java
dto/HomeworkCompletionDTO.java
dto/PaymentDTO.java
dto/TermWeekDTO.java
dto/TermDTO.java
dto/ClassOverviewDTO.java
model/ClassEntity.java (to verify nothing was accidentally changed)
service/ClassService.java
service/StudentService.java
service/HomeworkService.java
service/AttendanceService.java
service/PaymentService.java
service/TermService.java
controller/ClassController.java
controller/StudentController.java
controller/HomeworkController.java
controller/AttendanceController.java
controller/PaymentController.java
repository/AttendanceRepository.java
repository/HomeworkRepository.java
repository/HomeworkCompletionRepository.java
repository/PaymentRepository.java
repository/TermRepository.java
config/CorsConfig.java
BackendApplication.java
src/main/resources/application.properties

For each file, verify:

EXCEPTION LAYER
- ResourceNotFoundException extends RuntimeException with a String constructor
- GlobalExceptionHandler is annotated @RestControllerAdvice
- All four @ExceptionHandler methods are present and return the correct HTTP status codes
- No service file still throws a plain new RuntimeException(...)

VALIDATION LAYER
- spring-boot-starter-validation is in pom.xml
- All six request records exist with the correct field types and validation annotations
- Every controller method that accepts a request body uses @Valid and the correct record type
- No controller method still uses Map<String, Object> or Map<String, String> as a request body

SECURITY LAYER
- ClassController.deleteClass passes userId to classService.deleteClass
- ClassController.getClassOverview passes userId to classService.getClassOverview
- StudentController.deleteStudent passes userId to studentService.deleteStudent
- ClassService.deleteClass performs the ownership check before deleting
- ClassService.getClassOverview performs the ownership check
- StudentService.deleteStudent performs the ownership check
- All three ownership-checking methods throw ResponseStatusException FORBIDDEN when the user does not own the resource

DTO LAYER
- All eight response DTO records exist with correct fields
- Every DTO has a static from() factory method with the correct entity parameter type
- ClassOverviewDTO uses typed DTO fields (not Map<String, Object>)
- No controller method still returns Map<String, Object> or Map<String, String>
- ClassService.getClassOverview builds the response using DTO factory methods

TRANSACTION LAYER
- createClass, addStudent, createHomework, deleteHomework, toggleCompletion,
  updateAttendance, updatePayment all have @Transactional (no readOnly)
- deleteClass and deleteStudent have @Transactional (added during auth check step)
- All existing @Transactional(readOnly = true) methods are unchanged

LOGGING LAYER
- lombok is in pom.xml
- All five service classes have @Slf4j above @Service
- ClassService logs INFO on createClass, DEBUG on class created, WARN on deleteClass, DEBUG on getClassOverview
- StudentService logs INFO on addStudent, WARN on deleteStudent
- HomeworkService logs INFO on createHomework, WARN on deleteHomework, DEBUG on both toggleCompletion paths
- AttendanceService logs DEBUG on both updateAttendance paths
- PaymentService logs INFO on update path, DEBUG on create path

REPOSITORY LAYER
- findByStudentClassEntityId is gone from AttendanceRepository
- findByClassEntityId is gone from HomeworkRepository
- findByHomeworkClassEntityId is gone from HomeworkCompletionRepository
- findByStudentClassEntityId is gone from PaymentRepository
- findAllByOrderBySortOrderAsc is gone from TermRepository
- All remaining repository methods are actually called somewhere in the codebase

CORS & CACHING
- CorsConfig uses @Value injected allowedOrigins array, not hardcoded strings
- application.properties has cors.allowed-origins with localhost defaults
- BackendApplication has @EnableCaching
- TermService.getAllTerms has @Cacheable("terms")
- ClassService.getClassOverview calls termService.getAllTerms() not termRepository directly
- TermService is injected into ClassService

DEPENDENCIES & CREDENTIALS
- application.properties uses ${DATABASE_URL}, ${DATABASE_USERNAME}, ${DATABASE_PASSWORD}
- application-local.properties exists with the real values
- application-local.properties is listed in .gitignore

FINAL COMPILATION
- Run: cd backend && mvn compile
- If compilation succeeds, report: "Deep review complete. All checks passed. Final compilation successful."
- If any check fails or compilation fails, report every issue found with its file and line, then fix each one.
```

---

## Execution Notes

- Run prompts **strictly in order** — later prompts depend on changes made by earlier ones.
- Each prompt ends with `mvn compile`. Do not proceed to the next prompt if compilation fails.
- Prompts 6 and 7 together implement the full DTO layer — do not skip Prompt 6 before Prompt 7.
- Prompt 13 (caching) depends on the TermService injection change; read ClassService carefully before editing.
- Prompt 14 is read-only unless defects are found — its purpose is verification, not new changes.
