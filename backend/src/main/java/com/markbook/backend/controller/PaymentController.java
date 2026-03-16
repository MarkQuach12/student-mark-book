package com.markbook.backend.controller;

import com.markbook.backend.dto.PaymentDTO;
import com.markbook.backend.dto.request.UpdatePaymentRequest;
import com.markbook.backend.security.SecurityUtils;
import com.markbook.backend.service.ClassService;
import com.markbook.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class PaymentController {

    private final PaymentService paymentService;
    private final ClassService classService;

    public PaymentController(PaymentService paymentService, ClassService classService) {
        this.paymentService = paymentService;
        this.classService = classService;
    }

    @GetMapping("/classes/{classId}/payments")
    public List<PaymentDTO> getPayments(@PathVariable UUID classId) {
        classService.verifyClassAccess(SecurityUtils.getCurrentUserId(), classId);
        return paymentService.getPaymentsByClassId(classId).stream()
                .map(PaymentDTO::from)
                .toList();
    }

    @PutMapping("/payments")
    public PaymentDTO updatePayment(@RequestBody @Valid UpdatePaymentRequest body) {
        if (!SecurityUtils.isAdmin()) throw new ResponseStatusException(HttpStatus.FORBIDDEN);
        classService.verifyClassAccessByStudentId(SecurityUtils.getCurrentUserId(), body.studentId());
        return PaymentDTO.from(paymentService.updatePayment(
                body.studentId(),
                body.termKey(),
                body.weekIndex(),
                body.status()
        ));
    }
}
