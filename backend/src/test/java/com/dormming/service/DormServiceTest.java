package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.dorm.DormCreator;
import java.util.List;
import org.junit.jupiter.api.Test;

class DormServiceTest {

    World w = new World();

    @Test
    void creatorThenJoinWithLowercaseCode() {
        Dorm dorm = w.dormOfThree();
        assertThat(dorm.memberOf(w.a).orElseThrow()).isInstanceOf(DormCreator.class);
        assertThat(dorm.memberIdsInJoinOrder()).containsExactly(w.a, w.b, w.c);
    }

    @Test
    void cannotCreateOrJoinWhileInADorm() {
        Dorm dorm = w.dormOfThree();
        assertThatThrownBy(() -> w.dormService.create(w.a, "Another")).hasMessage("Leave your current dorm first");
        assertThatThrownBy(() -> w.dormService.join(w.b, dorm.code().value())).hasMessage("Leave your current dorm first");
    }

    @Test
    void unknownCodeIsNotFound() {
        assertThatThrownBy(() -> w.dormService.join(w.a, "ZZZZZZ")).isInstanceOf(NotFoundException.class);
    }

    @Test
    void cannotLeaveWithOpenBalance() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b)); // b owes a 10000
        assertThatThrownBy(() -> w.dormService.leave(w.b)).hasMessage("Settle your balance before leaving");
        w.payment(dorm, w.b, w.a, 10000);
        w.dormService.leave(w.b);
        assertThat(w.dormService.current(w.b)).isEmpty();
    }

    @Test
    void creatorLeavingPassesRoleOn() {
        Dorm dorm = w.dormOfThree();
        w.dormService.leave(w.a);
        assertThat(w.dorms.findById(dorm.id()).orElseThrow().memberOf(w.b).orElseThrow()).isInstanceOf(DormCreator.class);
    }

    @Test
    void lastMemberLeavingDeletesDorm() {
        Dorm dorm = w.dormService.create(w.a, "Solo");
        w.dormService.leave(w.a);
        assertThat(w.dorms.findById(dorm.id())).isEmpty();
    }

    @Test
    void onlyCreatorRemovesMembersOrRegeneratesCode() {
        Dorm dorm = w.dormOfThree();
        String oldCode = dorm.code().value();
        assertThatThrownBy(() -> w.dormService.removeMember(w.b, w.c)).isInstanceOf(NotAllowedException.class);
        assertThatThrownBy(() -> w.dormService.regenerateCode(w.b)).isInstanceOf(NotAllowedException.class);
        Dorm after = w.dormService.removeMember(w.a, w.c);
        assertThat(after.hasMember(w.c)).isFalse();
        assertThat(w.dormService.regenerateCode(w.a).code().value()).isNotEqualTo(oldCode);
    }

    @Test
    void removingMemberWithOpenBalanceIsBlocked() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.c));
        assertThatThrownBy(() -> w.dormService.removeMember(w.a, w.c)).hasMessageContaining("balance");
    }

    @Test
    void invitesGoToFriendsOnly() {
        w.dormOfThree();
        var d = w.user("d", "Dana");
        assertThatThrownBy(() -> w.dormService.inviteFriend(w.b, d)).isInstanceOf(IllegalArgumentException.class);
        w.friends.connect(w.b, d);
        w.dormService.inviteFriend(w.b, d);
        var invites = w.dormService.invitesFor(d);
        assertThat(invites).hasSize(1);
        Dorm joined = w.dormService.acceptInvite(d, invites.getFirst().id());
        assertThat(joined.hasMember(d)).isTrue();
        assertThat(w.dormService.invitesFor(d)).isEmpty();
    }
}
