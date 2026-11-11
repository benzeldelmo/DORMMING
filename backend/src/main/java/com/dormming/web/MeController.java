package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.user.CardColor;
import com.dormming.domain.user.User;
import com.dormming.repo.DormRepository;
import com.dormming.service.UserService;
import com.dormming.web.dto.AuthDtos.ProfilePatch;
import com.dormming.web.dto.MeDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserService users;
    private final DormRepository dorms;
    private final com.dormming.service.AccountService accounts;

    public MeController(UserService users, DormRepository dorms, com.dormming.service.AccountService accounts) {
        this.users = users;
        this.dorms = dorms;
        this.accounts = accounts;
    }

    private MeDto dto(User user) {
        return MeDto.of(user, dorms.findByMember(user.id()).map(Dorm::id).orElse(null));
    }

    @GetMapping
    MeDto me(@AuthenticationPrincipal Jwt jwt) {
        return dto(users.get(CurrentUser.id(jwt)));
    }

    @org.springframework.web.bind.annotation.DeleteMapping
    org.springframework.http.ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt) {
        accounts.delete(CurrentUser.id(jwt));
        return org.springframework.http.ResponseEntity.noContent().build();
    }

    @PatchMapping
    MeDto update(@AuthenticationPrincipal Jwt jwt, @RequestBody ProfilePatch patch) {
        CardColor color = patch.cardColor() == null ? null : CardColor.valueOf(patch.cardColor());
        return dto(users.update(CurrentUser.id(jwt), patch.displayName(), patch.mingName(), color));
    }
}
