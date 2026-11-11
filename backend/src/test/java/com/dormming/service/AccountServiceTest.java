package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.dorm.Dorm;
import java.util.List;
import org.junit.jupiter.api.Test;

class AccountServiceTest {

    World w = new World();

    @Test
    void cannotDeleteWithOpenBalance() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b)); // b owes a
        assertThatThrownBy(() -> w.accounts.delete(w.b)).hasMessage("Settle your balance before leaving");
        assertThat(w.users.findById(w.b)).isPresent();
    }

    @Test
    void deleteRemovesUserMembershipFriendsAndLogin() {
        Dorm dorm = w.dormOfThree();
        w.friends.connect(w.a, w.c);
        w.credentials.setHash("c@demo.ph", "hash");
        w.accounts.delete(w.c);
        assertThat(w.users.findById(w.c)).isEmpty();
        assertThat(w.dorms.findById(dorm.id()).orElseThrow().hasMember(w.c)).isFalse();
        assertThat(w.friends.friendsOf(w.a)).doesNotContain(w.c);
        assertThat(w.credentials.hashFor("c@demo.ph")).isEmpty();
    }

    @Test
    void deleteWithoutDormWorks() {
        var d = w.user("d", "Dana");
        w.accounts.delete(d);
        assertThat(w.users.findById(d)).isEmpty();
    }
}
