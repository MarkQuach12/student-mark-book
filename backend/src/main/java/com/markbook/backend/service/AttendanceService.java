package com.markbook.backend.service;

import com.markbook.backend.exception.ResourceNotFoundException;
import com.markbook.backend.model.Attendance;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;
    private final TermRepository termRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             StudentRepository studentRepository,
                             TermRepository termRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
        this.termRepository = termRepository;
    }

    @Transactional(readOnly = true)
    public List<Attendance> getAttendanceByClassId(UUID classId) {
        return attendanceRepository.findByClassIdWithFetch(classId);
    }

    @Transactional
    public Attendance updateAttendance(UUID studentId, String termKey, Short weekIndex, Boolean present) {
        return attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(studentId, termKey, weekIndex)
                .map(existing -> {
                    log.debug("Updating attendance studentId={} termKey={} weekIndex={} present={}", studentId, termKey, weekIndex, present);
                    existing.setPresent(present);
                    return attendanceRepository.save(existing);
                })
                .orElseGet(() -> {
                    log.debug("Creating attendance studentId={} termKey={} weekIndex={}", studentId, termKey, weekIndex);
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new ResourceNotFoundException("Student not found"));
                    Term term = termRepository.findById(termKey)
                            .orElseThrow(() -> new ResourceNotFoundException("Term not found"));

                    Attendance attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setTerm(term);
                    attendance.setWeekIndex(weekIndex);
                    attendance.setPresent(present);
                    return attendanceRepository.save(attendance);
                });
    }
}
