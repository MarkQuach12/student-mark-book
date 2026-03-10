package com.markbook.backend.controller;

import com.markbook.backend.dto.PaymentDTO;
import com.markbook.backend.dto.request.UpdatePaymentRequest;
import com.markbook.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @GetMapping("/classes/{classId}/payments")
    public List<PaymentDTO> getPayments(@PathVariable UUID classId) {
        return paymentService.getPaymentsByClassId(classId).stream()
                .map(PaymentDTO::from)
                .toList();
    }

    @PutMapping("/payments")
    public PaymentDTO updatePayment(@RequestBody @Valid UpdatePaymentRequest body) {
        return PaymentDTO.from(paymentService.updatePayment(
                body.studentId(),
                body.termKey(),
                body.weekIndex(),
                body.status()
        ));
    }
}
