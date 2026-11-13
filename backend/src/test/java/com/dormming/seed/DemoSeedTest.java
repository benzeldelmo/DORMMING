package com.dormming.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.repository.DormRepository;
import com.dormming.repository.UserRepository;
import com.dormming.service.BalanceService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "dormming.seed=true")
class DemoSeedTest {

    @Autowired
    UserRepository users;

    @Autowired
    DormRepository dorms;

    @Autowired
    BalanceService balances;

    @Test
    void benzelIsOwedOneThousandAndOwesNineHundred() {
        var benzel = users.findByEmail("benzel@demo.ph").orElseThrow();
        var dorm = dorms.findByMember(benzel.id()).orElseThrow();
        var ledger = balances.ledgerFor(dorm.id());
        assertThat(dorm.name()).isEqualTo("Mabini Hall 3B");
        assertThat(ledger.totalOwedTo(benzel.id()).centavos()).isEqualTo(100000);
        assertThat(ledger.totalOwedBy(benzel.id()).centavos()).isEqualTo(90000);
    }
}
