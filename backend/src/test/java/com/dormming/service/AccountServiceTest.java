package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.dormming.model.Dorm;
import java.util.List;
import org.junit.jupiter.api.Test;

class AccountServiceTest {

    World w = new World();

    @Test
    void deletingASettledAccountRemovesTheUserTheirBillsAndTheirDormPlace() {
        Dorm dorm = w.dormOfThree();
        w.bills.add(w.c, "Water", c(30000), w.today, false);
        w.accounts.delete(w.c);
        assertThat(w.users.findById(w.c)).isEmpty();
        assertThat(w.bills.list(w.c)).isEmpty();
        assertThat(w.dorms.findById(dorm.id()).orElseThrow().hasMember(w.c)).isFalse();
    }

    @Test
    void cannotDeleteWhileMoneyIsOpen() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b)); // b owes a
        assertThatThrownBy(() -> w.accounts.delete(w.b)).hasMessage("Settle your balance before leaving");
        assertThat(w.users.findById(w.b)).isPresent();
    }

    @Test
    void setsAndRemovesAProfilePhoto() {
        String photo = "data:image/jpeg;base64,/9j/4AAQSkZJRg==";
        assertThat(w.accounts.setPhoto(w.a, photo).photo()).isEqualTo(photo);
        assertThat(w.users.findById(w.a).orElseThrow().photo()).isEqualTo(photo);
        assertThat(w.accounts.setPhoto(w.a, null).photo()).isNull();
    }

    @Test
    void onlyTakesASmallImageAsAPhoto() {
        assertThatThrownBy(() -> w.accounts.setPhoto(w.a, "javascript:alert(1)")).hasMessage("Use a JPEG, PNG or WebP photo");
        String huge = "data:image/png;base64," + "A".repeat(400_000);
        assertThatThrownBy(() -> w.accounts.setPhoto(w.a, huge)).hasMessage("That photo is too big");
    }
}
