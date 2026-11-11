package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.ming.MingMood;
import com.dormming.domain.money.Money;
import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.User;
import java.util.List;

public record HomeData(User me, Dorm dorm, MingMood mood, String moodLine, Bill bannerBill, String bannerText,
        Money owedToMe, Money iOwe, List<Bill> upcomingBills, List<Transaction> recent) {
}
