package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.ledger.Ledger;
import com.dormming.domain.money.Money;
import com.dormming.domain.user.DigitalCard;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.service.BalanceService;
import com.dormming.service.DormService;
import com.dormming.service.FriendService;
import com.dormming.service.UserService;
import com.dormming.web.dto.UserRef;
import java.util.List;
import java.util.Map;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CardController {

    public record CardDto(String displayName, String dormName, String maskedNumber, long netCentavos,
            String cardColor, String friendCode, String qrPayload) {
    }

    private final UserService users;
    private final DormService dorms;
    private final BalanceService balances;
    private final FriendService friends;
    private final Views views;

    public CardController(UserService users, DormService dorms, BalanceService balances, FriendService friends,
            Views views) {
        this.users = users;
        this.dorms = dorms;
        this.balances = balances;
        this.friends = friends;
        this.views = views;
    }

    @GetMapping("/api/card")
    CardDto card(@AuthenticationPrincipal Jwt jwt) {
        UserId me = CurrentUser.id(jwt);
        User user = users.get(me);
        Dorm dorm = dorms.current(me).orElse(null);
        Money net = Money.ZERO;
        if (dorm != null) {
            Ledger ledger = balances.ledgerFor(dorm.id());
            net = ledger.totalOwedTo(me).minus(ledger.totalOwedBy(me));
        }
        DigitalCard card = DigitalCard.of(user, dorm == null ? "No dorm yet" : dorm.name(), net, views.appBaseUrl());
        return new CardDto(card.displayName(), card.dormName(), card.maskedNumber(), card.net().centavos(),
                card.color().name(), card.friendCode(), card.qrPayload());
    }

    @PostMapping("/api/friends")
    UserRef addFriend(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> body) {
        return UserRef.of(friends.connect(CurrentUser.id(jwt), body.get("friendCode")));
    }

    @GetMapping("/api/friends")
    List<UserRef> friends(@AuthenticationPrincipal Jwt jwt) {
        return friends.friends(CurrentUser.id(jwt)).stream().map(UserRef::of).toList();
    }
}
