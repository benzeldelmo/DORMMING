package com.dormming.domain.user;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.money.Money;
import org.junit.jupiter.api.Test;

class DigitalCardTest {

    static final FriendCode FC = FriendCode.parse("ABCD2345");

    @Test
    void cardPointsQrAtFriendLink() {
        User user = new User(new UserId("a"), "a@x.ph", "Benzel", "Ming", CardColor.OLIVE, FC);
        DigitalCard card = DigitalCard.of(user, "Mabini 3B", Money.ofCentavos(10000), "http://localhost:5173");
        assertThat(card.qrPayload()).isEqualTo("http://localhost:5173/add/ABCD2345");
        assertThat(card.maskedNumber()).matches("•••• •••• •••• \\d{4}");
    }

    @Test
    void blankMingNameDefaultsAndInitialsWork() {
        User user = new User(new UserId("a"), "a@x.ph", "Benzel Del Mo", " ", CardColor.OLIVE, FC);
        assertThat(user.mingName()).isEqualTo("Ming");
        assertThat(user.initials()).isEqualTo("BD");
        assertThat(user.withMingName("Mingky").mingName()).isEqualTo("Mingky");
    }
}
