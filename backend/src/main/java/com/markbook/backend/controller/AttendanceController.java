package com.markbook.backend.controller;

import com.markbook.backend.dto.AttendanceDTO;
import com.markbook.backend.dto.request.UpdateAttendanceRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.AttendanceService;
import com.markbook.backend.service.ClassService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.verifyClassAccessByStudentId(SecurityUtils.getCurrentUserId(), body.studentId());
        return AttendanceDTO.from(attendanceService.updateAttendance(
                body.studentId(),
                body.termKey(),
                body.weekIndex(),
                body.present()
        ));
    }
}
