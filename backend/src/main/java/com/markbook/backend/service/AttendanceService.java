package com.markbook.backend.service;

import com.markbook.backend.model.Attendance;
import com.markbook.backend.model.Student;
import com.markbook.backend.model.Term;
import com.markbook.backend.repository.AttendanceRepository;
import com.markbook.backend.repository.StudentRepository;
import com.markbook.backend.repository.TermRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

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

    public List<Attendance> getAttendanceByClassId(UUID classId) {
        return attendanceRepository.findByStudentClassEntityId(classId);
    }

    public Attendance updateAttendance(UUID studentId, String termKey, Short weekIndex, Boolean present) {
        return attendanceRepository.findByStudentIdAndTermKeyAndWeekIndex(studentId, termKey, weekIndex)
                .map(existing -> {
                    existing.setPresent(present);
                    return attendanceRepository.save(existing);
                })
                .orElseGet(() -> {
                    Student student = studentRepository.findById(studentId)
                            .orElseThrow(() -> new RuntimeException("Student not found"));
                    Term term = termRepository.findById(termKey)
                            .orElseThrow(() -> new RuntimeException("Term not found"));

                    Attendance attendance = new Attendance();
                    attendance.setStudent(student);
                    attendance.setTerm(term);
                    attendance.setWeekIndex(weekIndex);
                    attendance.setPresent(present);
                    return attendanceRepository.save(attendance);
                });
    }
}
