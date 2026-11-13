package com.dormming.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.model.Dorm;
import com.dormming.model.DormCreator;
import com.dormming.service.exception.NotFoundException;
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
}
