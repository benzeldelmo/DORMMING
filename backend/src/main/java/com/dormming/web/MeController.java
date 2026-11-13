package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.user.User;
import com.dormming.repo.DormRepository;
import com.dormming.service.UserService;
import com.dormming.web.dto.MeDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserService users;
    private final DormRepository dorms;

    public MeController(UserService users, DormRepository dorms) {
        this.users = users;
        this.dorms = dorms;
    }

    @GetMapping
    MeDto me(@AuthenticationPrincipal Jwt jwt) {
        User user = users.get(CurrentUser.id(jwt));
        return MeDto.of(user, dorms.findByMember(user.id()).map(Dorm::id).orElse(null));
    }
}
