package com.dormming.controller;

import com.dormming.controller.dto.DormDtos.CreateDormRequest;
import com.dormming.controller.dto.DormDtos.DormDto;
import com.dormming.controller.dto.DormDtos.JoinRequest;
import com.dormming.model.UserId;
import com.dormming.service.DormService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class DormController {

    private final DormService dorms;
    private final Views views;

    public DormController(DormService dorms, Views views) {
        this.dorms = dorms;
        this.views = views;
    }

    @PostMapping("/dorms")
    DormDto create(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateDormRequest req) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.create(me, req.name()), me);
    }

    @PostMapping("/dorms/join")
    DormDto join(@AuthenticationPrincipal Jwt jwt, @RequestBody JoinRequest req) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.join(me, req.code()), me);
    }

    @GetMapping("/dorms/current")
    ResponseEntity<DormDto> current(@AuthenticationPrincipal Jwt jwt) {
        UserId me = CurrentUser.id(jwt);
        return dorms.current(me).map(d -> ResponseEntity.ok(views.dorm(d, me)))
                .orElse(ResponseEntity.noContent().build());
    }

    /** Rename the dorm (creator only). */
    @PatchMapping("/dorms/current")
    DormDto rename(@AuthenticationPrincipal Jwt jwt, @RequestBody CreateDormRequest req) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.rename(me, req.name()), me);
    }

    @PostMapping("/dorms/current/leave")
    ResponseEntity<Void> leave(@AuthenticationPrincipal Jwt jwt) {
        dorms.leave(CurrentUser.id(jwt));
        return ResponseEntity.noContent().build();
    }
}
