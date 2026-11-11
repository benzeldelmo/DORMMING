package com.dormming.domain.dorm;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Category;
import com.dormming.domain.transaction.PersonalExpense;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.FriendCode;
import com.dormming.domain.user.UserId;
import java.time.Instant;
import java.time.LocalDate;
import java.util.Random;
import org.junit.jupiter.api.Test;

class DormTest {

    static final UserId A = new UserId("a");
    static final UserId B = new UserId("b");
    static final UserId C = new UserId("c");
    static final Instant T0 = Instant.parse("2026-11-11T08:00:00Z");

    static Transaction createdBy(UserId user) {
        return new PersonalExpense(null, user, Money.ofCentavos(100), LocalDate.of(2026, 11, 11), "", Category.OTHERS, T0);
    }

    static Dorm dorm() {
        Dorm dorm = Dorm.create("Mabini 3B", A, InviteCode.parse("AB3C9D"), T0);
        dorm.addMember(B, T0.plusSeconds(1));
        dorm.addMember(C, T0.plusSeconds(2));
        return dorm;
    }

    @Test
    void parsesAndGeneratesInviteCodes() {
        assertThat(InviteCode.parse(" ab3c9d ").value()).isEqualTo("AB3C9D");
        assertThatThrownBy(() -> InviteCode.parse("ABC")).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> InviteCode.parse("ABCD1O")).isInstanceOf(IllegalArgumentException.class);
        assertThat(InviteCode.generate(new Random(1)).value()).matches("[A-HJ-NP-Z2-9]{6}");
        assertThat(FriendCode.generate(new Random(1)).value()).matches("[A-HJ-NP-Z2-9]{8}");
    }

    @Test
    void creatorCanEditAnyRecordMemberOnlyOwn() {
        Dorm dorm = dorm();
        assertThat(dorm.memberOf(A).orElseThrow()).isInstanceOf(DormCreator.class);
        assertThat(dorm.memberOf(B).orElseThrow().canEdit(createdBy(A))).isFalse();
        assertThat(dorm.memberOf(B).orElseThrow().canEdit(createdBy(B))).isTrue();
        assertThat(dorm.memberOf(A).orElseThrow().canEdit(createdBy(B))).isTrue();
        assertThat(dorm.memberOf(B).orElseThrow().canRemoveMembers()).isFalse();
        assertThat(dorm.memberOf(A).orElseThrow().canRemoveMembers()).isTrue();
    }

    @Test
    void creatorRolePassesToNextMemberWhenCreatorLeaves() {
        Dorm dorm = dorm();
        dorm.removeMember(A);
        assertThat(dorm.memberOf(B).orElseThrow()).isInstanceOf(DormCreator.class);
        assertThat(dorm.memberIdsInJoinOrder()).containsExactly(B, C);
    }

    @Test
    void rejectsDuplicateMemberAndBadName() {
        Dorm dorm = dorm();
        assertThatThrownBy(() -> dorm.addMember(C, T0)).isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> Dorm.create(" ", A, InviteCode.parse("AB3C9D"), T0))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void emptiesWhenLastMemberLeaves() {
        Dorm dorm = Dorm.create("Solo", A, InviteCode.parse("AB3C9D"), T0);
        dorm.removeMember(A);
        assertThat(dorm.isEmpty()).isTrue();
    }
}
