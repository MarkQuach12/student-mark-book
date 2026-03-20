package com.markbook.backend.service;

import com.markbook.backend.dto.AuthResponse;
import com.markbook.backend.model.*;
import com.markbook.backend.repository.*;
import com.markbook.backend.security.JwtUtil;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class DemoService {

    private static final Logger log = LoggerFactory.getLogger(DemoService.class);
    static final String DEMO_USER_ID = "demo-user";
    static final String DEMO_EMAIL = "demo@demo.markbook.com";
    static final String DEMO_ADMIN_ID = "demo-admin";
    static final String DEMO_ADMIN_EMAIL = "demo-admin@demo.markbook.com";

    private final UserRepository userRepository;
    private final ClassRepository classRepository;
    private final StudentRepository studentRepository;
    private final HomeworkRepository homeworkRepository;
    private final HomeworkCompletionRepository homeworkCompletionRepository;
    private final AttendanceRepository attendanceRepository;
    private final PaymentRepository paymentRepository;
    private final ExamRepository examRepository;
    private final TopicRepository topicRepository;
    private final ResourceRepository resourceRepository;
    private final ClassTopicVisibilityRepository classTopicVisibilityRepository;
    private final UserClassAssignmentRepository userClassAssignmentRepository;
    private final TermRepository termRepository;
    private final JwtUtil jwtUtil;

    public DemoService(UserRepository userRepository,
                       ClassRepository classRepository,
                       StudentRepository studentRepository,
                       HomeworkRepository homeworkRepository,
                       HomeworkCompletionRepository homeworkCompletionRepository,
                       AttendanceRepository attendanceRepository,
                       PaymentRepository paymentRepository,
                       ExamRepository examRepository,
                       TopicRepository topicRepository,
                       ResourceRepository resourceRepository,
                       ClassTopicVisibilityRepository classTopicVisibilityRepository,
                       UserClassAssignmentRepository userClassAssignmentRepository,
                       TermRepository termRepository,
                       JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.classRepository = classRepository;
        this.studentRepository = studentRepository;
        this.homeworkRepository = homeworkRepository;
        this.homeworkCompletionRepository = homeworkCompletionRepository;
        this.attendanceRepository = attendanceRepository;
        this.paymentRepository = paymentRepository;
        this.examRepository = examRepository;
        this.topicRepository = topicRepository;
        this.resourceRepository = resourceRepository;
        this.classTopicVisibilityRepository = classTopicVisibilityRepository;
        this.userClassAssignmentRepository = userClassAssignmentRepository;
        this.termRepository = termRepository;
        this.jwtUtil = jwtUtil;
    }

    /**
     * On startup, ensure the shared demo account and its data exist.
     */
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void ensureDemoAccount() {
        try {
            var existingUser = userRepository.findById(DEMO_USER_ID);
            if (existingUser.isPresent()) {
                // Check if user actually has classes (data might be missing)
                List<ClassEntity> classes = classRepository.findByUserId(DEMO_USER_ID);
                if (!classes.isEmpty()) {
                    log.info("Demo account already exists with data, skipping creation");
                    return;
                }
                // User exists but no data — rebuild
                log.info("Demo account exists but has no data, building demo data...");
                List<Term> terms = termRepository.findAllWithWeeks();
                log.info("Found {} terms with weeks: {}", terms.size(),
                        terms.stream().map(t -> t.getKey() + "(" + (t.getWeeks() != null ? t.getWeeks().size() : 0) + " weeks)").toList());
                buildDemoData(existingUser.get());
                log.info("Demo data rebuilt successfully");
                return;
            }

            log.info("Creating shared demo account...");
            User demoUser = new User(DEMO_USER_ID, "Demo User", DEMO_EMAIL);
            demoUser.setRole("USER");
            demoUser.setPasswordHash(null);
            demoUser = userRepository.saveAndFlush(demoUser);

            List<Term> terms = termRepository.findAllWithWeeks();
            log.info("Found {} terms for new demo account", terms.size());
            buildDemoData(demoUser);
            log.info("Shared demo account created successfully");
        } catch (Exception e) {
            log.error("Failed to create demo account: {}", e.getMessage(), e);
        }

        // Ensure demo admin account exists
        try {
            ensureDemoAdmin();
        } catch (Exception e) {
            log.error("Failed to create demo admin account: {}", e.getMessage(), e);
        }
    }

    private void ensureDemoAdmin() {
        var existingAdmin = userRepository.findById(DEMO_ADMIN_ID);
        if (existingAdmin.isPresent()) {
            log.info("Demo admin account already exists, skipping creation");
            return;
        }

        log.info("Creating demo admin account...");
        User demoAdmin = new User(DEMO_ADMIN_ID, "Demo Admin", DEMO_ADMIN_EMAIL);
        demoAdmin.setRole("ADMIN");
        demoAdmin.setPasswordHash(null);
        userRepository.saveAndFlush(demoAdmin);
        log.info("Demo admin account created successfully");
    }

    /**
     * Issue a JWT for the shared demo account. No DB writes needed.
     */
    public AuthResponse getDemoSession() {
        String token = jwtUtil.generateToken(DEMO_USER_ID, "USER");
        return new AuthResponse(token, DEMO_USER_ID, "Demo User", DEMO_EMAIL, "USER");
    }

    /**
     * Issue a JWT for the shared demo admin account. No DB writes needed.
     */
    public AuthResponse getDemoAdminSession() {
        String token = jwtUtil.generateToken(DEMO_ADMIN_ID, "ADMIN");
        return new AuthResponse(token, DEMO_ADMIN_ID, "Demo Admin", DEMO_ADMIN_EMAIL, "ADMIN");
    }

    private void buildDemoData(User demoUser) {
        List<Term> allTerms = termRepository.findAllWithWeeks();

        ClassEntity year5 = new ClassEntity();
        year5.setUser(demoUser);
        year5.setClassLevel("Year 5");
        year5.setDayOfWeek("Monday");
        year5.setStartTime(LocalTime.of(15, 30));
        year5.setEndTime(LocalTime.of(17, 0));
        classRepository.save(year5);

        ClassEntity year8 = new ClassEntity();
        year8.setUser(demoUser);
        year8.setClassLevel("Year 8");
        year8.setDayOfWeek("Wednesday");
        year8.setStartTime(LocalTime.of(16, 0));
        year8.setEndTime(LocalTime.of(17, 30));
        classRepository.save(year8);

        List<Student> year5Students = createStudents(year5, demoUser,
                List.of("Alice Chen", "James Park", "Sarah Kim", "Daniel Lee"));
        List<Student> year8Students = createStudents(year8, demoUser,
                List.of("Emma Wang", "Liam Zhang", "Olivia Liu", "Noah Tan"));

        List<Homework> year5Homework = createHomeworkForClass(year5, allTerms);
        List<Homework> year8Homework = createHomeworkForClass(year8, allTerms);

        createHomeworkCompletions(year5Students, year5Homework);
        createHomeworkCompletions(year8Students, year8Homework);

        createAttendanceAndPayments(year5Students, allTerms);
        createAttendanceAndPayments(year8Students, allTerms);

        Exam year5Exam = new Exam();
        year5Exam.setClassEntity(year5);
        year5Exam.setTitle("Year 5 Mid-Term Exam");
        year5Exam.setExamDate(LocalDate.now().plusDays(3));
        examRepository.save(year5Exam);

        Exam year8Exam = new Exam();
        year8Exam.setClassEntity(year8);
        year8Exam.setTitle("Year 8 Mid-Term Exam");
        year8Exam.setExamDate(LocalDate.now().plusDays(2));
        examRepository.save(year8Exam);

        createTopicsAndResources(year5, "Year 5");
        createTopicsAndResources(year8, "Year 8");

        UserClassAssignment assignment1 = new UserClassAssignment();
        assignment1.setUser(demoUser);
        assignment1.setClassEntity(year5);
        userClassAssignmentRepository.save(assignment1);

        UserClassAssignment assignment2 = new UserClassAssignment();
        assignment2.setUser(demoUser);
        assignment2.setClassEntity(year8);
        userClassAssignmentRepository.save(assignment2);
    }

    private List<Student> createStudents(ClassEntity classEntity, User user, List<String> names) {
        List<Student> students = new ArrayList<>();
        for (String name : names) {
            Student student = new Student();
            student.setClassEntity(classEntity);
            student.setUser(user);
            student.setName(name);
            students.add(studentRepository.save(student));
        }
        return students;
    }

    private List<Homework> createHomeworkForClass(ClassEntity classEntity, List<Term> terms) {
        List<Homework> allHomework = new ArrayList<>();
        String[] hwTitles = {"Practice Questions", "Worksheet", "Revision Sheet", "Problem Set",
                "Textbook Exercises", "Challenge Problems"};
        int titleIndex = 0;

        for (Term term : terms) {
            if (term.getWeeks() == null) continue;
            for (TermWeek week : term.getWeeks()) {
                for (int h = 0; h < 2; h++) {
                    Homework homework = new Homework();
                    homework.setClassEntity(classEntity);
                    homework.setTerm(term);
                    homework.setWeekIndex(week.getWeekIndex());
                    homework.setTitle(hwTitles[titleIndex % hwTitles.length] + " " + (h + 1));
                    allHomework.add(homeworkRepository.save(homework));
                    titleIndex++;
                }
            }
        }
        return allHomework;
    }

    private void createHomeworkCompletions(List<Student> students, List<Homework> homeworkList) {
        int index = 0;
        for (Homework homework : homeworkList) {
            for (Student student : students) {
                HomeworkCompletion completion = new HomeworkCompletion();
                completion.setStudent(student);
                completion.setHomework(homework);
                boolean completed = (index % 10) < 7;
                completion.setCompleted(completed);
                homeworkCompletionRepository.save(completion);
                index++;
            }
        }
    }

    private void createAttendanceAndPayments(List<Student> students, List<Term> terms) {
        String[] presentStatuses = {"paid_cash", "unpaid", "paid_online", "paid_cash", "unpaid", "paid_online", "paid_cash", "paid_cash"};
        int attIndex = 0;
        int payIndex = 0;

        for (Term term : terms) {
            if (term.getWeeks() == null) continue;
            for (TermWeek week : term.getWeeks()) {
                for (int s = 0; s < students.size(); s++) {
                    Student student = students.get(s);

                    boolean present;
                    switch (s) {
                        case 0 -> present = (attIndex % 8) != 0;
                        case 1 -> present = (attIndex % 5) != 0;
                        case 2 -> present = (attIndex % 4) != 0;
                        default -> present = (attIndex % 3) != 0;
                    }

                    Attendance attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setTerm(term);
                    attendance.setWeekIndex(week.getWeekIndex());
                    attendance.setPresent(present);
                    attendanceRepository.save(attendance);

                    Payment payment = new Payment();
                    payment.setStudent(student);
                    payment.setTerm(term);
                    payment.setWeekIndex(week.getWeekIndex());
                    if (present) {
                        payment.setStatus(presentStatuses[payIndex % presentStatuses.length]);
                        payIndex++;
                    } else {
                        payment.setStatus("away");
                    }
                    paymentRepository.save(payment);

                    attIndex++;
                }
            }
        }
    }

    private void createTopicsAndResources(ClassEntity classEntity, String classLevel) {
        if (classLevel.equals("Year 5")) {
            Topic algebra = createTopic("[Demo] Algebra Basics", classLevel, 0);
            createResource(algebra, "Algebra Introduction", "https://drive.google.com/file/d/demo-algebra-intro", "pdf", 0);
            createResource(algebra, "Variables Worksheet", "https://drive.google.com/file/d/demo-variables-ws", "doc", 1);
            createResource(algebra, "Algebra Practice Slides", "https://drive.google.com/file/d/demo-algebra-slides", "pptx", 2);
            createVisibility(classEntity, algebra);

            Topic fractions = createTopic("[Demo] Fractions", classLevel, 1);
            createResource(fractions, "Fractions Guide", "https://drive.google.com/file/d/demo-fractions-guide", "pdf", 0);
            createResource(fractions, "Fractions Exercises", "https://drive.google.com/file/d/demo-fractions-ex", "doc", 1);
            createVisibility(classEntity, fractions);
        } else {
            Topic geometry = createTopic("[Demo] Geometry", classLevel, 0);
            createResource(geometry, "Geometry Fundamentals", "https://drive.google.com/file/d/demo-geometry-fund", "pdf", 0);
            createResource(geometry, "Shapes and Angles Worksheet", "https://drive.google.com/file/d/demo-shapes-ws", "doc", 1);
            createResource(geometry, "Geometry Presentation", "https://drive.google.com/file/d/demo-geometry-pres", "pptx", 2);
            createVisibility(classEntity, geometry);

            Topic equations = createTopic("[Demo] Linear Equations", classLevel, 1);
            createResource(equations, "Solving Linear Equations", "https://drive.google.com/file/d/demo-linear-eq", "pdf", 0);
            createResource(equations, "Equations Practice Set", "https://drive.google.com/file/d/demo-eq-practice", "doc", 1);
            createVisibility(classEntity, equations);
        }
    }

    private Topic createTopic(String name, String classLevel, int sortOrder) {
        Topic topic = new Topic();
        topic.setName(name);
        topic.setClassLevel(classLevel);
        topic.setSortOrder(sortOrder);
        return topicRepository.save(topic);
    }

    private void createResource(Topic topic, String title, String driveUrl, String fileType, int sortOrder) {
        Resource resource = new Resource();
        resource.setTopic(topic);
        resource.setTitle(title);
        resource.setDriveUrl(driveUrl);
        resource.setFileType(fileType);
        resource.setSortOrder(sortOrder);
        resourceRepository.save(resource);
    }

    private void createVisibility(ClassEntity classEntity, Topic topic) {
        ClassTopicVisibility visibility = new ClassTopicVisibility();
        visibility.setClassEntity(classEntity);
        visibility.setTopic(topic);
        visibility.setVisible(true);
        classTopicVisibilityRepository.save(visibility);
    }
}
