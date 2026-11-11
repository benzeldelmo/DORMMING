package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.transaction.Transaction;
import com.dormming.service.ActivityService;
import com.dormming.web.dto.ExpenseDtos.ActivityDto;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ActivityController {

    private final ActivityService activity;
    private final Views views;

    public ActivityController(ActivityService activity, Views views) {
        this.activity = activity;
        this.views = views;
    }

    @GetMapping("/api/activity")
    List<ActivityDto> recent(@AuthenticationPrincipal Jwt jwt, @RequestParam(defaultValue = "50") int limit) {
        return activity.recent(CurrentUser.id(jwt), limit).stream().map(this::dto).toList();
    }

    ActivityDto dto(Transaction t) {
        return new ActivityDto(t.id(), t.type().name(), t.describe(views.names()), t.amount().centavos(), t.date(),
                views.ref(t.createdBy()));
    }
}
