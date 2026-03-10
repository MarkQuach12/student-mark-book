package com.markbook.backend.controller;

import com.markbook.backend.dto.AttendanceDTO;
import com.markbook.backend.dto.request.UpdateAttendanceRequest;
import com.markbook.backend.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/classes/{classId}/attendance")
    public List<AttendanceDTO> getAttendance(@PathVariable UUID classId) {
        return attendanceService.getAttendanceByClassId(classId).stream()
                .map(AttendanceDTO::from)
                .toList();
    }

    @PutMapping("/attendance")
    public AttendanceDTO updateAttendance(@RequestBody @Valid UpdateAttendanceRequest body) {
        return AttendanceDTO.from(attendanceService.updateAttendance(
                body.studentId(),
                body.termKey(),
                body.weekIndex(),
                body.present()
        ));
    }
}
