package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.spending.SpendingReport;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import com.dormming.service.DormService;
import java.time.Clock;
import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class SpendingController {

    public record CategoryDto(String category, String label, long totalCentavos) {
    }

    public record SpendingDto(String month, long totalCentavos, long previousTotalCentavos, List<CategoryDto> byCategory) {
    }

    private final DormService dorms;
    private final TransactionRepository transactions;
    private final Clock clock;

    public SpendingController(DormService dorms, TransactionRepository transactions, Clock clock) {
        this.dorms = dorms;
        this.transactions = transactions;
        this.clock = clock;
    }

    @GetMapping("/api/spending")
    SpendingDto spending(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String month) {
        YearMonth ym;
        try {
            ym = month == null ? YearMonth.now(clock) : YearMonth.parse(month);
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("Month must look like 2026-11");
        }
        return summary(CurrentUser.id(jwt), ym);
    }

    public SpendingDto summary(UserId user, YearMonth month) {
        Dorm dorm = dorms.require(user);
        var expenses = transactions.sharedByDorm(dorm.id());
        var bills = transactions.billsByDorm(dorm.id());
        SpendingReport report = SpendingReport.of(month, expenses, bills);
        SpendingReport previous = SpendingReport.of(month.minusMonths(1), expenses, bills);
        return new SpendingDto(month.toString(), report.total().centavos(), previous.total().centavos(),
                report.byCategory().stream()
                        .map(t -> new CategoryDto(t.category().name(), t.category().label(), t.total().centavos()))
                        .toList());
    }
}
