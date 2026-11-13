package com.dormming.controller;

import com.dormming.controller.dto.MoneyDtos.PaymentRequest;
import com.dormming.service.PaymentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/** Record payments: paying back a dormmate. */
@RestController
public class PaymentController {

    private final PaymentService payments;

    public PaymentController(PaymentService payments) {
        this.payments = payments;
    }

    @PostMapping("/api/payments")
    ResponseEntity<Void> pay(@AuthenticationPrincipal Jwt jwt, @RequestBody PaymentRequest req) {
        payments.record(CurrentUser.id(jwt), Requests.user(req.toUserId()), Requests.money(req.amountCentavos()),
                req.note(), null);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
