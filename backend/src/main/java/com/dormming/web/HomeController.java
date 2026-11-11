package com.dormming.web;

import com.dormming.auth.CurrentUser;
import com.dormming.domain.user.UserId;
import com.dormming.service.HomeData;
import com.dormming.service.HomeService;
import com.dormming.web.dto.MeDto;
import com.dormming.web.dto.MoneyDtos.BannerDto;
import com.dormming.web.dto.MoneyDtos.HomeDto;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HomeController {

    private final HomeService home;
    private final Views views;
    private final BillController bills;
    private final ActivityController activity;

    public HomeController(HomeService home, Views views, BillController bills, ActivityController activity) {
        this.home = home;
        this.views = views;
        this.bills = bills;
        this.activity = activity;
    }

    @GetMapping("/api/home")
    HomeDto home(@AuthenticationPrincipal Jwt jwt) {
        UserId me = CurrentUser.id(jwt);
        HomeData h = home.home(me);
        BannerDto banner = h.bannerBill() == null ? null : new BannerDto(h.bannerBill().id(), h.bannerText(),
                h.bannerBill().shareOf(me).map(s -> s.amount().centavos()).orElse(0L));
        return new HomeDto(MeDto.of(h.me(), h.dorm() == null ? null : h.dorm().id()),
                h.dorm() == null ? null : views.dorm(h.dorm(), me), h.mood().name(), h.moodLine(), banner,
                h.owedToMe().centavos(), h.iOwe().centavos(),
                h.upcomingBills().stream().map(b -> bills.dto(b, me)).toList(),
                h.recent().stream().map(activity::dto).toList());
    }
}
