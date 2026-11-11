package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.user.UserId;
import com.dormming.service.DormService;
import com.dormming.web.dto.DormDtos.CreateDormRequest;
import com.dormming.web.dto.DormDtos.DormDto;
import com.dormming.web.dto.DormDtos.InviteDto;
import com.dormming.web.dto.DormDtos.InviteRequest;
import com.dormming.web.dto.DormDtos.JoinRequest;
import java.util.List;
import org.springframework.http.HttpStatus;
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

    @PostMapping("/dorms/current/leave")
    ResponseEntity<Void> leave(@AuthenticationPrincipal Jwt jwt) {
        dorms.leave(CurrentUser.id(jwt));
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/dorms/current/members/{userId}")
    DormDto remove(@AuthenticationPrincipal Jwt jwt, @PathVariable String userId) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.removeMember(me, new UserId(userId)), me);
    }

    @PostMapping("/dorms/current/code")
    DormDto newCode(@AuthenticationPrincipal Jwt jwt) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.regenerateCode(me), me);
    }

    @PostMapping("/dorms/current/invites")
    ResponseEntity<Void> invite(@AuthenticationPrincipal Jwt jwt, @RequestBody InviteRequest req) {
        dorms.inviteFriend(CurrentUser.id(jwt), new UserId(req.friendId()));
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @GetMapping("/invites")
    List<InviteDto> invites(@AuthenticationPrincipal Jwt jwt) {
        return dorms.invitesFor(CurrentUser.id(jwt)).stream().map(views::invite).toList();
    }

    @PostMapping("/invites/{id}/accept")
    DormDto accept(@AuthenticationPrincipal Jwt jwt, @PathVariable String id) {
        UserId me = CurrentUser.id(jwt);
        return views.dorm(dorms.acceptInvite(me, id), me);
    }
}
