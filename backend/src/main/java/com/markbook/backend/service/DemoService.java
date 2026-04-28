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

    private record ClassSpec(
            String level,
            String day,
            LocalTime start,
            LocalTime end,
            List<String> studentNames
    ) {}

    private static final List<ClassSpec> CLASS_SPECS = List.of(
            new ClassSpec("Year 3", "Monday", LocalTime.of(14, 0), LocalTime.of(15, 30),
                    List.of("Mia Tran", "Lucas Vo", "Ava Patel", "Ethan Singh", "Isabella Mehta", "Mason Reddy")),
            new ClassSpec("Year 5", "Monday", LocalTime.of(15, 30), LocalTime.of(17, 0),
                    List.of("Alice Chen", "James Park", "Sarah Kim", "Daniel Lee", "Sophia Nguyen", "Jackson Choi")),
            new ClassSpec("Year 6", "Tuesday", LocalTime.of(14, 0), LocalTime.of(15, 30),
                    List.of("Charlotte Wong", "Henry Lin", "Amelia Cho", "Benjamin Yu", "Harper Sun", "Sebastian Ho")),
            new ClassSpec("Year 7", "Tuesday", LocalTime.of(16, 0), LocalTime.of(17, 30),
                    List.of("Ella Hwang", "Caleb Tran", "Grace Truong", "Owen Nguyen", "Lily Pham", "Wyatt Le")),
            new ClassSpec("Year 8", "Wednesday", LocalTime.of(16, 0), LocalTime.of(17, 30),
                    List.of("Emma Wang", "Liam Zhang", "Olivia Liu", "Noah Tan", "Aria Hsu", "Levi Yang")),
            new ClassSpec("Year 9", "Thursday", LocalTime.of(16, 0), LocalTime.of(17, 30),
                    List.of("Chloe Ng", "Ezra Pham", "Layla Hong", "Lincoln Bae", "Stella Ng", "Aiden Sim")),
            new ClassSpec("Year 10", "Friday", LocalTime.of(16, 0), LocalTime.of(17, 30),
                    List.of("Penelope Han", "Roman Quach", "Hazel Vu", "Jaxon Vu", "Aurora Doan", "Asher Mai"))
    );

    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void ensureDemoAccount() {
        try {
            var existingUser = userRepository.findById(DEMO_USER_ID);
            if (existingUser.isPresent()) {
                List<ClassEntity> classes = classRepository.findByUserId(DEMO_USER_ID);
                if (!classes.isEmpty()) {
                    log.info("Demo account already exists with data, skipping creation");
                    return;
                }
                log.info("Demo account exists but has no data, building demo data...");
                buildDemoData(existingUser.get());
                log.info("Demo data rebuilt successfully");
                return;
            }

            log.info("Creating shared demo account...");
            User demoUser = new User(DEMO_USER_ID, "Demo User", DEMO_EMAIL);
            demoUser.setRole("USER");
            demoUser.setPasswordHash(null);
            demoUser = userRepository.saveAndFlush(demoUser);

            buildDemoData(demoUser);
            log.info("Shared demo account created successfully");
        } catch (Exception e) {
            log.error("Failed to create demo account: {}", e.getMessage(), e);
        }

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

    public AuthResponse getDemoSession() {
        String token = jwtUtil.generateToken(DEMO_USER_ID, "USER");
        return new AuthResponse(token, DEMO_USER_ID, "Demo User", DEMO_EMAIL, "USER");
    }

    public AuthResponse getDemoAdminSession() {
        String token = jwtUtil.generateToken(DEMO_ADMIN_ID, "ADMIN");
        return new AuthResponse(token, DEMO_ADMIN_ID, "Demo Admin", DEMO_ADMIN_EMAIL, "ADMIN");
    }

    private void buildDemoData(User demoUser) {
        List<Term> allTerms = termRepository.findAllWithWeeks();
        log.info("Found {} terms for demo data build", allTerms.size());

        for (ClassSpec spec : CLASS_SPECS) {
            ClassEntity cls = new ClassEntity();
            cls.setUser(demoUser);
            cls.setClassLevel(spec.level());
            cls.setDayOfWeek(spec.day());
            cls.setStartTime(spec.start());
            cls.setEndTime(spec.end());
            cls = classRepository.save(cls);

            List<Student> students = createStudentUsers(cls, spec.studentNames());

            List<Homework> homework = createHomeworkForClass(cls, allTerms);
            createHomeworkCompletions(students, homework);
            createAttendanceAndPayments(students, allTerms);

            Exam exam = new Exam();
            exam.setClassEntity(cls);
            exam.setTitle(spec.level() + " Mid-Term Exam");
            exam.setExamDate(LocalDate.now().plusDays(2 + CLASS_SPECS.indexOf(spec)));
            examRepository.save(exam);

            createTopicsAndResources(cls, spec.level());

            UserClassAssignment demoAssignment = new UserClassAssignment();
            demoAssignment.setUser(demoUser);
            demoAssignment.setClassEntity(cls);
            userClassAssignmentRepository.save(demoAssignment);
        }

        log.info("Seeded {} classes with student users", CLASS_SPECS.size());
    }

    private List<Student> createStudentUsers(ClassEntity classEntity, List<String> names) {
        List<Student> students = new ArrayList<>();
        for (String fullName : names) {
            String slug = slug(fullName);
            String userId = "demo-stu-" + slug;
            String email = slug.replace('-', '.') + "@demo.markbook.com";

            User studentUser = userRepository.findById(userId).orElseGet(() -> {
                User u = new User(userId, fullName, email);
                u.setRole("USER");
                u.setPasswordHash(null);
                return userRepository.save(u);
            });

            Student student = new Student();
            student.setClassEntity(classEntity);
            student.setUser(studentUser);
            student.setName(fullName);
            students.add(studentRepository.save(student));

            UserClassAssignment uca = new UserClassAssignment();
            uca.setUser(studentUser);
            uca.setClassEntity(classEntity);
            userClassAssignmentRepository.save(uca);
        }
        return students;
    }

    private static String slug(String name) {
        return name.toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("(^-|-$)", "");
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
                    switch (s % 4) {
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
        } else if (classLevel.equals("Year 8")) {
            Topic geometry = createTopic("[Demo] Geometry", classLevel, 0);
            createResource(geometry, "Geometry Fundamentals", "https://drive.google.com/file/d/demo-geometry-fund", "pdf", 0);
            createResource(geometry, "Shapes and Angles Worksheet", "https://drive.google.com/file/d/demo-shapes-ws", "doc", 1);
            createResource(geometry, "Geometry Presentation", "https://drive.google.com/file/d/demo-geometry-pres", "pptx", 2);
            createVisibility(classEntity, geometry);

            Topic equations = createTopic("[Demo] Linear Equations", classLevel, 1);
            createResource(equations, "Solving Linear Equations", "https://drive.google.com/file/d/demo-linear-eq", "pdf", 0);
            createResource(equations, "Equations Practice Set", "https://drive.google.com/file/d/demo-eq-practice", "doc", 1);
            createVisibility(classEntity, equations);
        } else {
            Topic core = createTopic("[Demo] " + classLevel + " Core", classLevel, 0);
            createResource(core, classLevel + " Overview", "https://drive.google.com/file/d/demo-" + slug(classLevel) + "-overview", "pdf", 0);
            createResource(core, classLevel + " Worksheet", "https://drive.google.com/file/d/demo-" + slug(classLevel) + "-ws", "doc", 1);
            createVisibility(classEntity, core);
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
