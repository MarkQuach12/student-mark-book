package com.markbook.backend.controller;

import com.markbook.backend.model.Payment;
import com.markbook.backend.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/classes/{classId}/payments")
    public List<Map<String, Object>> getPayments(@PathVariable UUID classId) {
        return paymentService.getPaymentsByClassId(classId).stream()
                .map(p -> Map.<String, Object>of(
                        "studentId", p.getStudent().getId(),
                        "termKey", p.getTerm().getKey(),
                        "weekIndex", p.getWeekIndex(),
                        "status", p.getStatus()
                ))
                .toList();
    }

    @PutMapping("/payments")
    public Map<String, Object> updatePayment(@RequestBody Map<String, Object> body) {
        Payment payment = paymentService.updatePayment(
                UUID.fromString((String) body.get("studentId")),
                (String) body.get("termKey"),
                ((Number) body.get("weekIndex")).shortValue(),
                (String) body.get("status")
        );

        return Map.of(
                "studentId", payment.getStudent().getId(),
                "termKey", payment.getTerm().getKey(),
                "weekIndex", payment.getWeekIndex(),
                "status", payment.getStatus()
        );
    }
}
