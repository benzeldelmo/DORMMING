package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import org.junit.jupiter.api.Test;

class FriendServiceTest {

    World w = new World();

    String codeOf(com.dormming.domain.user.UserId id) {
        return w.users.findById(id).orElseThrow().friendCode().value();
    }

    @Test
    void connectsBothWaysOnceWithLowercaseCode() {
        w.friendService.connect(w.a, codeOf(w.b).toLowerCase());
        w.friendService.connect(w.a, codeOf(w.b));
        assertThat(w.friendService.friends(w.a)).extracting(u -> u.id()).containsExactly(w.b);
        assertThat(w.friendService.friends(w.b)).extracting(u -> u.id()).containsExactly(w.a);
    }

    @Test
    void rejectsOwnAndUnknownCodes() {
        assertThatThrownBy(() -> w.friendService.connect(w.a, codeOf(w.a))).hasMessage("That's your own card");
        assertThatThrownBy(() -> w.friendService.connect(w.a, "ZZZZZZZZ")).isInstanceOf(NotFoundException.class);
    }
}
