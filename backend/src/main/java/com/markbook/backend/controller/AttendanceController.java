package com.markbook.backend.controller;

import com.markbook.backend.model.Attendance;
import com.markbook.backend.service.AttendanceService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/classes/{classId}/attendance")
    public List<Map<String, Object>> getAttendance(@PathVariable UUID classId) {
        return attendanceService.getAttendanceByClassId(classId).stream()
                .map(a -> Map.<String, Object>of(
                        "studentId", a.getStudent().getId(),
                        "termKey", a.getTerm().getKey(),
                        "weekIndex", a.getWeekIndex(),
                        "present", a.getPresent()
                ))
                .toList();
    }

    @PutMapping("/attendance")
    public Map<String, Object> updateAttendance(@RequestBody Map<String, Object> body) {
        Attendance attendance = attendanceService.updateAttendance(
                UUID.fromString((String) body.get("studentId")),
                (String) body.get("termKey"),
                ((Number) body.get("weekIndex")).shortValue(),
                (Boolean) body.get("present")
        );

        return Map.of(
                "studentId", attendance.getStudent().getId(),
                "termKey", attendance.getTerm().getKey(),
                "weekIndex", attendance.getWeekIndex(),
                "present", attendance.getPresent()
        );
    }
}
