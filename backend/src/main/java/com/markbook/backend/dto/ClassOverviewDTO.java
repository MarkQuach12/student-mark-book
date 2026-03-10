package com.markbook.backend.dto;

import java.util.List;

public record ClassOverviewDTO(
    ClassDTO classInfo,
    List<StudentDTO> students,
    List<HomeworkDTO> homework,
    List<AttendanceDTO> attendance,
    List<HomeworkCompletionDTO> completions,
    List<PaymentDTO> payments,
    List<TermDTO> terms
) {}
