package com.markbook.backend.service;

import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import com.markbook.backend.security.SecurityUtils;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
public class ChatService {

    private final ClassRepository classRepository;
    private final UserClassAssignmentRepository assignmentRepository;
    private final ExamRepository examRepository;
    private final PaymentRepository paymentRepository;
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final HomeworkRepository homeworkRepository;
    private final ExtraLessonRepository extraLessonRepository;
    private final UserRepository userRepository;
    private final TermRepository termRepository;
    private final ObjectMapper objectMapper;

    @Value("${anthropic.api-key:}")
    private String anthropicApiKey;

    private static final String ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

    public ChatService(ClassRepository classRepository,
                       UserClassAssignmentRepository assignmentRepository,
                       ExamRepository examRepository,
                       PaymentRepository paymentRepository,
                       AttendanceRepository attendanceRepository,
                       StudentRepository studentRepository,
                       HomeworkRepository homeworkRepository,
                       ExtraLessonRepository extraLessonRepository,
                       UserRepository userRepository,
                       TermRepository termRepository,
                       ObjectMapper objectMapper) {
        this.classRepository = classRepository;
        this.assignmentRepository = assignmentRepository;
        this.examRepository = examRepository;
        this.paymentRepository = paymentRepository;
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.homeworkRepository = homeworkRepository;
        this.extraLessonRepository = extraLessonRepository;
        this.userRepository = userRepository;
        this.termRepository = termRepository;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public String chat(String userId, String userMessage) {
        if (anthropicApiKey == null || anthropicApiKey.isBlank()) {
            return "Chat is not configured. Please set the ANTHROPIC_API_KEY environment variable.";
        }

        try {
            String context = buildUserContext(userId);
            return callClaude(context, userMessage);
        } catch (Exception e) {
            log.error("Chat error for userId={}", userId, e);
            return "Sorry, I'm having trouble right now. Please try again later.";
        }
    }

    private String buildUserContext(String userId) {
        StringBuilder ctx = new StringBuilder();
        ctx.append("Today's date: ").append(LocalDate.now()).append("\n\n");

        // User info
        userRepository.findById(userId).ifPresent(user ->
                ctx.append("User: ").append(user.getName()).append(" (").append(user.getEmail()).append(")\n")
        );

        // Get accessible classes
        List<ClassEntity> classes;
        if (SecurityUtils.isAdmin()) {
            classes = classRepository.findAll();
        } else {
            List<UUID> classIds = assignmentRepository.findByUserId(userId).stream()
                    .map(a -> a.getClassEntity().getId())
                    .toList();
            classes = classIds.isEmpty() ? List.of() : classRepository.findAllById(classIds);
        }

        if (classes.isEmpty()) {
            ctx.append("This user has no classes assigned.\n");
            return ctx.toString();
        }

        // Load all terms and weeks for gap-filling attendance/payments
        List<Term> allTerms = termRepository.findAllWithWeeks();

        // Classes
        ctx.append("\n--- CLASSES ---\n");
        for (ClassEntity c : classes) {
            ctx.append("- ").append(c.getClassLevel())
                    .append(" | ").append(c.getDayOfWeek())
                    .append(" ").append(c.getStartTime()).append("-").append(c.getEndTime());
            if (c.getLabel() != null) ctx.append(" (").append(c.getLabel()).append(")");
            ctx.append(" [id:").append(c.getId()).append("]\n");

            // Students in this class
            List<Student> students = studentRepository.findByClassEntityId(c.getId());
            List<Payment> payments = paymentRepository.findByClassIdWithFetch(c.getId());
            List<Attendance> attendance = attendanceRepository.findByClassIdWithFetch(c.getId());

            if (!students.isEmpty()) {
                ctx.append("  Students:\n");
                for (Student s : students) {
                    ctx.append("    ").append(s.getName()).append(":\n");

                    // Per-student payments
                    List<Payment> studentPayments = payments.stream()
                            .filter(p -> p.getStudent().getId().equals(s.getId()))
                            .toList();
                    if (studentPayments.isEmpty()) {
                        ctx.append("      Payments: none recorded\n");
                    } else {
                        for (Payment p : studentPayments) {
                            ctx.append("      - ").append(formatTermKey(p.getTerm().getKey()))
                                    .append(" week ").append(p.getWeekIndex())
                                    .append(": ").append(p.getStatus().replace("_", " ")).append("\n");
                        }
                    }

                    // Per-student attendance (recorded weeks + summary of unrecorded)
                    List<Attendance> studentAttendance = attendance.stream()
                            .filter(a -> a.getStudent().getId().equals(s.getId()))
                            .toList();
                    ctx.append("      Attendance:\n");
                    if (!studentAttendance.isEmpty()) {
                        for (Attendance a : studentAttendance) {
                            ctx.append("      - ").append(formatTermKey(a.getTerm().getKey()))
                                    .append(" week ").append(a.getWeekIndex())
                                    .append(": ").append(Boolean.TRUE.equals(a.getPresent()) ? "present" : "absent").append("\n");
                        }
                    }
                    // List all term/weeks with no record
                    List<String> unmarked = new java.util.ArrayList<>();
                    for (Term term : allTerms) {
                        if (term.getWeeks() == null) continue;
                        for (TermWeek tw : term.getWeeks()) {
                            boolean hasRecord = studentAttendance.stream()
                                    .anyMatch(a -> a.getTerm().getKey().equals(term.getKey())
                                            && a.getWeekIndex().equals(tw.getWeekIndex()));
                            if (!hasRecord) {
                                unmarked.add(formatTermKey(term.getKey()) + " wk" + tw.getWeekIndex());
                            }
                        }
                    }
                    if (!unmarked.isEmpty()) {
                        ctx.append("      Not marked (attendance not recorded): ")
                                .append(String.join(", ", unmarked)).append("\n");
                    }
                }
            }

            // Homework
            List<Homework> homework = homeworkRepository.findByClassIdWithFetch(c.getId());
            if (!homework.isEmpty()) {
                ctx.append("  Homework: ");
                homework.forEach(h -> ctx.append(h.getTitle())
                        .append(" (").append(formatTermKey(h.getTerm().getKey())).append(" wk").append(h.getWeekIndex()).append("), "));
                ctx.append("\n");
            }
        }

        // Exams
        List<UUID> classIds = classes.stream().map(ClassEntity::getId).toList();
        List<Exam> exams = examRepository.findByClassEntityIdIn(classIds);
        if (!exams.isEmpty()) {
            ctx.append("\n--- EXAMS ---\n");
            for (Exam e : exams) {
                ctx.append("- ").append(e.getTitle())
                        .append(" | ").append(e.getExamDate())
                        .append(" | Class: ").append(e.getClassEntity().getClassLevel()).append("\n");
            }
        }

        // Extra lessons
        List<ExtraLesson> extraLessons = extraLessonRepository.findByClassEntityIdIn(classIds);
        if (!extraLessons.isEmpty()) {
            ctx.append("\n--- EXTRA LESSONS ---\n");
            for (ExtraLesson el : extraLessons) {
                ctx.append("- ").append(el.getTitle())
                        .append(" | ").append(el.getLessonDate())
                        .append(" ").append(el.getStartTime()).append("-").append(el.getEndTime())
                        .append(" | Class: ").append(el.getClassEntity().getClassLevel()).append("\n");
            }
        }

        return ctx.toString();
    }

    private String callClaude(String context, String userMessage) throws Exception {
        String systemPrompt = """
                You are a helpful assistant for a student mark book application. \
                You help users (teachers/admins) answer questions about their classes, students, exams, payments, attendance, and homework.

                Answer based ONLY on the provided data context. Be concise and friendly. \
                If you don't have enough information to answer, say so. \
                Format dates in a readable way (e.g. "Wednesday, March 18th"). \
                When listing items, use short bullet points.

                Here is the user's data:

                """ + context;

        String requestBody = objectMapper.writeValueAsString(new ClaudeRequest(
                "claude-haiku-4-5-20251001",
                1024,
                systemPrompt,
                List.of(new ClaudeMessage("user", userMessage))
        ));

        HttpClient client = HttpClient.newHttpClient();
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ANTHROPIC_API_URL))
                .header("Content-Type", "application/json")
                .header("x-api-key", anthropicApiKey)
                .header("anthropic-version", "2023-06-01")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() != 200) {
            log.error("Claude API error: status={} body={}", response.statusCode(), response.body());
            return "Sorry, I couldn't process your request right now.";
        }

        JsonNode root = objectMapper.readTree(response.body());
        JsonNode content = root.path("content");
        if (content.isArray() && !content.isEmpty()) {
            return content.get(0).path("text").asText();
        }

        return "Sorry, I didn't get a response.";
    }

    private String formatTermKey(String key) {
        return key.replaceAll("(\\D)(\\d)", "$1 $2");
    }

    // Inner records for Claude API request serialization
    private record ClaudeRequest(String model, int max_tokens, String system, List<ClaudeMessage> messages) {}
    private record ClaudeMessage(String role, String content) {}
}
