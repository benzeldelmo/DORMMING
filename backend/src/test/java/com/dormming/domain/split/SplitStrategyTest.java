package com.dormming.domain.split;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.assertj.core.api.Assertions.entry;

import com.dormming.domain.money.Money;
import com.dormming.domain.user.UserId;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class SplitStrategyTest {

    static final UserId A = new UserId("a");
    static final UserId B = new UserId("b");
    static final UserId C = new UserId("c");

    static Money c(long centavos) {
        return Money.ofCentavos(centavos);
    }

    @Test
    void equalSplitGivesLeftoverToNonPayersInOrder() {
        assertThat(new EqualSplit().split(c(10000), List.of(A, B, C), A))
                .containsExactly(entry(A, c(3333)), entry(B, c(3334)), entry(C, c(3333)));
    }

    @Test
    void equalSplitWithoutPayerGivesLeftoverToFirstPeople() {
        assertThat(new EqualSplit().split(c(10000), List.of(A, B, C), null).get(A)).isEqualTo(c(3334));
    }

    @Test
    void customSplitAcceptsAmountsThatAddUp() {
        assertThat(new CustomSplit(Map.of(A, c(6000), B, c(4000))).split(c(10000), List.of(A, B), A))
                .containsEntry(A, c(6000))
                .containsEntry(B, c(4000));
    }

    @Test
    void customSplitRejectsMismatchMissingPersonAndNegative() {
        assertThatThrownBy(() -> new CustomSplit(Map.of(A, c(6000), B, c(3999))).split(c(10000), List.of(A, B), A))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new CustomSplit(Map.of(A, c(10000))).split(c(10000), List.of(A, B), A))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new CustomSplit(Map.of(A, c(11000), B, c(-1000))).split(c(10000), List.of(A, B), A))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void itemizedSplitExact() {
        var rice = new ReceiptItem("Rice", c(30000), List.of(A, B, C));
        var beer = new ReceiptItem("Beer", c(20000), List.of(B, C));
        assertThat(new ItemizedSplit(List.of(rice, beer), c(5000)).split(c(55000), List.of(A, B, C), A))
                .containsExactly(entry(A, c(11000)), entry(B, c(22000)), entry(C, c(22000)));
    }

    @Test
    void itemizedSplitRoundsExtrasByLargestRemainder() {
        var coffee = new ReceiptItem("Coffee", c(10000), List.of(A, B, C));
        assertThat(new ItemizedSplit(List.of(coffee), c(100)).split(c(10100), List.of(A, B, C), A))
                .containsExactly(entry(A, c(3366)), entry(B, c(3368)), entry(C, c(3366)));
    }

    @Test
    void itemizedSplitHandlesDiscount() {
        var pizza = new ReceiptItem("Pizza", c(10000), List.of(A, B));
        assertThat(new ItemizedSplit(List.of(pizza), c(-1000)).split(c(9000), List.of(A, B), A))
                .containsExactly(entry(A, c(4500)), entry(B, c(4500)));
    }

    @Test
    void itemizedSplitRejectsTotalMismatch() {
        var coffee = new ReceiptItem("Coffee", c(10000), List.of(A, B, C));
        assertThatThrownBy(() -> new ItemizedSplit(List.of(coffee), Money.ZERO).split(c(9000), List.of(A, B, C), A))
                .hasMessageContaining("add up");
    }

    @Test
    void itemizedSplitRejectsSharerOutsidePeople() {
        var coffee = new ReceiptItem("Coffee", c(10000), List.of(A, C));
        assertThatThrownBy(() -> new ItemizedSplit(List.of(coffee), Money.ZERO).split(c(10000), List.of(A, B), A))
                .isInstanceOf(IllegalArgumentException.class);
    }

    @Test
    void rejectsEmptyPeopleDuplicatesAndNonPositiveTotal() {
        assertThatThrownBy(() -> new EqualSplit().split(c(100), List.of(), null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new EqualSplit().split(c(100), List.of(A, A), null))
                .isInstanceOf(IllegalArgumentException.class);
        assertThatThrownBy(() -> new EqualSplit().split(c(0), List.of(A), null))
                .isInstanceOf(IllegalArgumentException.class);
    }
}
