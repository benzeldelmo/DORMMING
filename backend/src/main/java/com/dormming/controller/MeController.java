package com.dormming.controller;

import com.dormming.controller.dto.MeDto;
import com.dormming.model.Dorm;
import com.dormming.model.User;
import com.dormming.repository.DormRepository;
import com.dormming.repository.UserRepository;
import com.dormming.service.AccountService;
import com.dormming.service.AuthService;
import com.dormming.service.exception.UnauthorizedException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** Who is logged in, and their dorm (if any). */
@RestController
@RequestMapping("/api/me")
public class MeController {

    private final UserRepository users;
    private final DormRepository dorms;
    private final AccountService accounts;
    private final AuthService auth;

    public MeController(UserRepository users, DormRepository dorms, AccountService accounts, AuthService auth) {
        this.users = users;
        this.dorms = dorms;
        this.accounts = accounts;
        this.auth = auth;
    }

    @GetMapping
    MeDto me(@AuthenticationPrincipal Jwt jwt) {
        // A valid token for a user that no longer exists (in-memory data reset on restart): log in again.
        User user = users.findById(CurrentUser.id(jwt))
                .orElseThrow(() -> new UnauthorizedException("Please log in again"));
        return MeDto.of(user, dorms.findByMember(user.id()).map(Dorm::id).orElse(null));
    }

    public record PhotoRequest(String photo) {
    }

    /** Sets your profile photo (a small image data URL), or removes it with {"photo": null}. */
    @PutMapping("/photo")
    MeDto photo(@AuthenticationPrincipal Jwt jwt, @RequestBody PhotoRequest body) {
        User user = accounts.setPhoto(CurrentUser.id(jwt), body.photo());
        return MeDto.of(user, dorms.findByMember(user.id()).map(Dorm::id).orElse(null));
    }

    /** Deletes your account once you're settled up: your dorm place, your bills and your login. */
    @DeleteMapping
    ResponseEntity<Void> delete(@AuthenticationPrincipal Jwt jwt) {
        User gone = accounts.delete(CurrentUser.id(jwt));
        auth.forget(gone.email());
        return ResponseEntity.noContent().build();
    }
}
