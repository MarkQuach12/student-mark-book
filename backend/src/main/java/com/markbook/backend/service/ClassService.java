package com.markbook.backend.service;

import com.markbook.backend.model.ClassEntity;
import com.markbook.backend.model.User;
import com.markbook.backend.repository.ClassRepository;
import com.markbook.backend.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.List;
import java.util.UUID;

@Service
public class ClassService {

    private final ClassRepository classRepository;
    private final UserRepository userRepository;

    public ClassService(ClassRepository classRepository, UserRepository userRepository) {
        this.classRepository = classRepository;
        this.userRepository = userRepository;
    }

    public List<ClassEntity> getClassesForUser(String userId) {
        return classRepository.findByUserId(userId);
    }

    public ClassEntity getClassById(UUID id) {
        return classRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Class not found"));
    }

    public ClassEntity createClass(String userId, String classLevel, String dayOfWeek, LocalTime startTime, LocalTime endTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        ClassEntity classEntity = new ClassEntity();
        classEntity.setUser(user);
        classEntity.setClassLevel(classLevel);
        classEntity.setDayOfWeek(dayOfWeek);
        classEntity.setStartTime(startTime);
        classEntity.setEndTime(endTime);

        return classRepository.save(classEntity);
    }

    public void deleteClass(UUID id) {
        classRepository.deleteById(id);
    }
}
