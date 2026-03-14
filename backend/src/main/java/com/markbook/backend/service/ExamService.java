package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Exam;
import com.markbook.backend.model.User;
import com.markbook.backend.repository.ExamRepository;
import com.markbook.backend.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ExamService {

    private final ExamRepository examRepository;
    private final UserRepository userRepository;

    public ExamService(ExamRepository examRepository, UserRepository userRepository) {
        this.examRepository = examRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsForUser(String userId) {
        return examRepository.findByUserId(userId);
    }

    @Transactional(readOnly = true)
    public List<Exam> getExamsInRange(String userId, LocalDate start, LocalDate end) {
        return examRepository.findByUserIdAndExamDateBetween(userId, start, end);
    }

    @Transactional
    public Exam createExam(String userId, String title, LocalDate examDate) {
        log.info("Creating exam for userId={} title={} date={}", userId, title, examDate);

        User user = userRepository.findById(userId)
                .orElseGet(() -> {
                    User newUser = new User(userId, userId, userId);
                    return userRepository.save(newUser);
                });

        Exam exam = new Exam();
        exam.setUser(user);
        exam.setTitle(title);
        exam.setExamDate(examDate);

        Exam saved = examRepository.save(exam);
        log.debug("Exam created id={}", saved.getId());
        return saved;
    }

    @Transactional
    public void deleteExam(UUID id, String userId) {
        Exam exam = examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found"));
        if (!exam.getUser().getId().equals(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Access denied");
        }
        log.warn("Deleting exam id={} by userId={}", id, userId);
        examRepository.delete(exam);
    }
}
