package com.markbook.backend.controller;

import com.markbook.backend.dto.AttendanceDTO;
import com.markbook.backend.dto.request.UpdateAttendanceRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.AttendanceService;
import com.markbook.backend.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final ClassService classService;

    public AttendanceController(AttendanceService attendanceService, ClassService classService) {
        this.attendanceService = attendanceService;
        this.classService = classService;
    }

    @GetMapping("/classes/{classId}/attendance")
    public List<AttendanceDTO> getAttendance(@PathVariable UUID classId) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return attendanceService.getAttendanceByClassId(classId).stream()
                .map(AttendanceDTO::from)
                .toList();
    }

    @PutMapping("/attendance")
    public AttendanceDTO updateAttendance(@RequestBody @Valid UpdateAttendanceRequest body) {
        classService.verifyClassAccessByStudentId(SecurityUtils.getCurrentUserId(), body.studentId());
        return AttendanceDTO.from(attendanceService.updateAttendance(
                body.studentId(),
                body.termKey(),
                body.weekIndex(),
                body.present()
        ));
    }
}
