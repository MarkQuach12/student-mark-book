package com.markbook.backend.dto;

import com.markbook.backend.model.Payment;

import java.util.UUID;

public record PaymentDTO(UUID studentId, String termKey, Short weekIndex, String status) {
    public static PaymentDTO from(Payment p) {
        return new PaymentDTO(p.getStudent().getId(), p.getTerm().getKey(),
                p.getWeekIndex(), p.getStatus());
    }
}
