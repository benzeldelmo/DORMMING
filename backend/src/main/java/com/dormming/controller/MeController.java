package com.dormming.controller;

import com.dormming.controller.dto.MeDto;
import com.dormming.model.Dorm;
import com.dormming.model.User;
import com.dormming.repository.DormRepository;
import com.dormming.repository.UserRepository;
import com.dormming.service.exception.UnauthorizedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Who is logged in, and their dorm (if any). */
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository users;
    private final DormRepository dorms;

    public MeController(UserRepository users, DormRepository dorms) {
        this.users = users;
        this.dorms = dorms;
    }

    @GetMapping
    MeDto me(@AuthenticationPrincipal Jwt jwt) {
        // A valid token for a user that no longer exists (in-memory data reset on restart): log in again.
        User user = users.findById(CurrentUser.id(jwt))
                .orElseThrow(() -> new UnauthorizedException("Please log in again"));
        return MeDto.of(user, dorms.findByMember(user.id()).map(Dorm::id).orElse(null));
    }
}
