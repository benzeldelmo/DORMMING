package com.dormming.controller;

import com.dormming.controller.dto.ExpenseDtos.ExpenseDto;
import com.dormming.controller.dto.ExpenseDtos.ItemDto;
import com.dormming.controller.dto.ExpenseDtos.ShareDto;
import com.dormming.controller.dto.ExpenseDtos.SharedRequest;
import com.dormming.model.Dorm;
import com.dormming.model.SharedExpense;
import com.dormming.model.UserId;
import com.dormming.service.DormService;
import com.dormming.service.ExpenseService;
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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenses;
    private final DormService dorms;
    private final Views views;

    public ExpenseController(ExpenseService expenses, DormService dorms, Views views) {
        this.expenses = expenses;
        this.dorms = dorms;
        this.views = views;
    }

    ExpenseDto dto(SharedExpense s, UserId viewer) {
        var category = s.category();
        {
            Dorm dorm = dorms.current(viewer).orElse(null);
            boolean canEdit = dorm != null && dorm.memberOf(viewer).map(m -> m.canEdit(s)).orElse(false);
            var shares = s.participants().stream()
                    .map(p -> new ShareDto(views.ref(p), s.shares().get(p).centavos())).toList();
            var items = s.items().stream().map(i -> new ItemDto(i.name(), i.price().centavos(),
                    i.sharers().stream().map(views::ref).toList())).toList();
            return new ExpenseDto(s.id(), s.amount().centavos(), category.name(), category.label(), s.note(),
                    s.date(), views.ref(s.createdBy()), views.ref(s.payer()), s.splitType().name(), shares, items,
                    s.extras().centavos(), canEdit, s.describe(views.names()));
        }
    }

    @GetMapping
    List<ExpenseDto> list(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) String q) {
        UserId me = CurrentUser.id(jwt);
        return expenses.list(me, q).stream().map(t -> dto(t, me)).toList();
    }

    @PostMapping("/shared")
    ExpenseDto addShared(@AuthenticationPrincipal Jwt jwt, @RequestBody SharedRequest req) {
        UserId me = CurrentUser.id(jwt);
        return dto(expenses.addShared(me, Requests.shared(req)), me);
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        expenses.delete(CurrentUser.id(jwt), id);
        return ResponseEntity.noContent().build();
    }
}
