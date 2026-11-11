package com.dormming.seed;

import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.ming.MingMood;
import com.dormming.repo.UserRepository;
import com.dormming.service.HomeData;
import com.dormming.service.HomeService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest(properties = "dormming.seed=true")
class DemoSeedTest {

    @Autowired
    UserRepository users;

    @Autowired
    HomeService home;

    @Test
    void benzelSeesTheMockupNumbers() {
        var benzel = users.findByEmail("benzel@demo.ph").orElseThrow();
        HomeData h = home.home(benzel.id());
        assertThat(h.owedToMe().centavos()).isEqualTo(100000);
        assertThat(h.iOwe().centavos()).isEqualTo(90000);
        assertThat(h.bannerText()).contains("Internet");
        assertThat(h.mood()).isEqualTo(MingMood.WORRIED);
        assertThat(h.dorm().name()).isEqualTo("Mabini Hall 3B");
    }
}
