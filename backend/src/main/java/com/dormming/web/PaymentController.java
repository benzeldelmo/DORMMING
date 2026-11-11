package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.ledger.Ledger;
import com.dormming.domain.user.UserId;
import com.dormming.service.BalanceService;
import com.dormming.service.DormService;
import com.dormming.service.PaymentService;
import com.dormming.web.dto.MoneyDtos.BalancesDto;
import com.dormming.web.dto.MoneyDtos.DebtDto;
import com.dormming.web.dto.MoneyDtos.PaymentRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class PaymentController {

    private final PaymentService payments;
    private final BalanceService balances;
    private final DormService dorms;
    private final Views views;

    public PaymentController(PaymentService payments, BalanceService balances, DormService dorms, Views views) {
        this.payments = payments;
        this.balances = balances;
        this.dorms = dorms;
        this.views = views;
    }

    @PostMapping("/api/payments")
    ResponseEntity<Void> pay(@AuthenticationPrincipal Jwt jwt, @RequestBody PaymentRequest req) {
        payments.record(CurrentUser.id(jwt), Requests.user(req.toUserId()), Requests.money(req.amountCentavos()),
                req.note(), null);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/api/balances")
    BalancesDto balances(@AuthenticationPrincipal Jwt jwt) {
        UserId me = CurrentUser.id(jwt);
        Ledger ledger = balances.ledgerFor(dorms.require(me).id());
        List<DebtDto> debts = ledger.debtsInvolving(me).stream()
                .map(d -> d.to().equals(me)
                        ? new DebtDto(views.ref(d.from()), d.amount().centavos(), "OWES_ME")
                        : new DebtDto(views.ref(d.to()), d.amount().centavos(), "I_OWE"))
                .toList();
        long owedToMe = ledger.totalOwedTo(me).centavos();
        long iOwe = ledger.totalOwedBy(me).centavos();
        return new BalancesDto(owedToMe, iOwe, owedToMe - iOwe, debts);
    }
}
