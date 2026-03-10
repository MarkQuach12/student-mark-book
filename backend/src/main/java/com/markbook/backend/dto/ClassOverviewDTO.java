package com.markbook.backend.dto;

import java.util.List;
import java.util.Map;

public record ClassOverviewDTO(
    Map<String, Object> classInfo,
    List<Map<String, Object>> students,
    List<Map<String, Object>> homework,
    List<Map<String, Object>> attendance,
    List<Map<String, Object>> completions,
    List<Map<String, Object>> payments,
    List<Map<String, Object>> terms
) {}
