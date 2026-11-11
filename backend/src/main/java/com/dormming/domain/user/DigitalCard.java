package com.dormming.domain.user;

import com.dormming.domain.money.Money;

/** The simulated bank-style card. The back's QR adds the owner as a friend. */
public record DigitalCard(String displayName, String dormName, String maskedNumber, Money net, CardColor color,
        String friendCode, String qrPayload) {

    public static DigitalCard of(User user, String dormName, Money net, String appBaseUrl) {
        int last4 = Math.floorMod(user.id().value().hashCode(), 10000);
        return new DigitalCard(user.displayName(), dormName, "•••• •••• •••• %04d".formatted(last4), net,
                user.cardColor(), user.friendCode().value(), appBaseUrl + "/add/" + user.friendCode().value());
    }
}
