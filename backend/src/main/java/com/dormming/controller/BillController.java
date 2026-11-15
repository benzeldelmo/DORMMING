package com.dormming.controller;

import com.dormming.controller.dto.BillDtos.BillDto;
import com.dormming.controller.dto.BillDtos.BillRequest;
import com.dormming.model.Bill;
import com.dormming.service.BillService;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Your payment reminders. */
@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService bills;

    public BillController(BillService bills) {
        this.bills = bills;
    }

    private static BillDto dto(Bill b) {
        return new BillDto(b.id(), b.name(), b.amount().centavos(), b.dueDate(), b.monthly());
    }

    @GetMapping
    List<BillDto> list(@AuthenticationPrincipal Jwt jwt) {
        return bills.list(CurrentUser.id(jwt)).stream().map(BillController::dto).toList();
    }

    @PostMapping
    BillDto add(@AuthenticationPrincipal Jwt jwt, @RequestBody BillRequest req) {
        return dto(bills.add(CurrentUser.id(jwt), req.name(), Requests.money(req.amountCentavos()), req.dueDate(), req.monthly()));
    }

    @PostMapping("/{id}/paid")
    ResponseEntity<BillDto> pay(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        Bill next = bills.pay(CurrentUser.id(jwt), id);
        return next == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(dto(next));
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        bills.delete(CurrentUser.id(jwt), id);
        return ResponseEntity.noContent().build();
    }
}
