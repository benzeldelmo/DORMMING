package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.user.UserId;
import com.dormming.service.BillInput;
import com.dormming.service.BillService;
import com.dormming.service.DormService;
import com.dormming.web.dto.MoneyDtos.BillDto;
import com.dormming.web.dto.MoneyDtos.BillRequest;
import com.dormming.web.dto.MoneyDtos.BillShareDto;
import java.time.Clock;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService bills;
    private final DormService dorms;
    private final Views views;
    private final Clock clock;

    public BillController(BillService bills, DormService dorms, Views views, Clock clock) {
        this.bills = bills;
        this.dorms = dorms;
        this.views = views;
        this.clock = clock;
    }

    BillDto dto(Bill bill, UserId viewer) {
        LocalDate today = LocalDate.now(clock);
        var mine = bill.shareOf(viewer);
        boolean canEdit = dorms.current(viewer).flatMap(d -> d.memberOf(viewer)).map(m -> m.canEdit(bill)).orElse(false);
        List<BillShareDto> shares = bill.shares().stream()
                .map(s -> new BillShareDto(views.ref(s.userId()), s.amount().centavos(), s.isPaid())).toList();
        return new BillDto(bill.id(), bill.name(), bill.category().name(), bill.category().label(),
                bill.amount().centavos(), bill.dueDate(), bill.recurrence().code(), bill.remindDaysBefore(),
                mine.map(s -> s.amount().centavos()).orElse(null), mine.map(s -> s.isPaid()).orElse(false),
                bill.isOverdueFor(viewer, today), bill.isDueWithin(viewer, today, bill.remindDaysBefore()), shares,
                canEdit);
    }

    @GetMapping
    List<BillDto> list(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "upcoming") String status) {
        UserId me = CurrentUser.id(jwt);
        return bills.list(me, status, LocalDate.now(clock)).stream().map(b -> dto(b, me)).toList();
    }

    @PostMapping
    BillDto create(@AuthenticationPrincipal Jwt jwt, @RequestBody BillRequest req) {
        UserId me = CurrentUser.id(jwt);
        SplitType split = req.split() == null || req.split().type() == null ? SplitType.EQUAL
                : Requests.choice(SplitType.class, req.split().type(), "how to split");
        Map<String, Long> amounts = req.split() == null ? null : req.split().amounts();
        BillInput input = new BillInput(req.name(), Requests.category(req.category()),
                Requests.money(req.amountCentavos()), req.dueDate(), req.recurrence() == null ? "NONE" : req.recurrence(),
                req.remindDaysBefore() == null ? 1 : req.remindDaysBefore(), split, Requests.amounts(amounts));
        return dto(bills.create(me, input), me);
    }

    @PostMapping("/{id}/pay")
    BillDto pay(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        UserId me = CurrentUser.id(jwt);
        return dto(bills.pay(me, id), me);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        bills.delete(CurrentUser.id(jwt), id);
        return ResponseEntity.noContent().build();
    }
}
