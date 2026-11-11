package com.dormming.service;

import static com.dormming.service.World.c;
import static org.assertj.core.api.Assertions.assertThat;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.ming.MingMood;
import com.dormming.domain.split.SplitType;
import com.dormming.domain.transaction.Category;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import org.junit.jupiter.api.Test;

class HomeServiceTest {

    World w = new World();

    @Test
    void worriedWithDueTomorrowBanner() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b));
        w.bills.create(w.a, new BillInput("Internet", Category.INTERNET_LOAD, c(150000), LocalDate.of(2026, 11, 12),
                "MONTHLY", 1, SplitType.EQUAL, Map.of()));
        HomeData home = w.home.home(w.b);
        assertThat(home.mood()).isEqualTo(MingMood.WORRIED);
        assertThat(home.bannerText()).isEqualTo("Your Internet is due tomorrow!");
        assertThat(home.iOwe()).isEqualTo(c(10000));
        assertThat(home.owedToMe()).isEqualTo(c(0));
    }

    @Test
    void celebratesAfterSettlingUp() {
        Dorm dorm = w.dormOfThree();
        w.sharedEqual(dorm, w.a, 20000, List.of(w.a, w.b));
        w.payments.record(w.b, w.a, c(10000), "", w.today);
        assertThat(w.home.home(w.b).mood()).isEqualTo(MingMood.CELEBRATING);
    }

    @Test
    void overdueBannerText() {
        w.dormOfThree();
        w.bills.create(w.a, new BillInput("Water", Category.RENT_UTILITIES, c(100000), LocalDate.of(2026, 11, 9),
                "NONE", 1, SplitType.EQUAL, Map.of()));
        assertThat(w.home.home(w.c).bannerText()).isEqualTo("Your Water is overdue!");
    }
}
