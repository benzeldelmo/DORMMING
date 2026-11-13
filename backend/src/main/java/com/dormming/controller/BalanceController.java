package com.dormming.controller;

import com.dormming.controller.dto.MoneyDtos.BalancesDto;
import com.dormming.controller.dto.MoneyDtos.DebtDto;
import com.dormming.model.Ledger;
import com.dormming.model.UserId;
import com.dormming.service.BalanceService;
import com.dormming.service.DormService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** View balances: who owes me, and whom I owe, after netting. */
@RestController
public class BalanceController {

    private final BalanceService balances;
    private final DormService dorms;
    private final Views views;

    public BalanceController(BalanceService balances, DormService dorms, Views views) {
        this.balances = balances;
        this.dorms = dorms;
        this.views = views;
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
