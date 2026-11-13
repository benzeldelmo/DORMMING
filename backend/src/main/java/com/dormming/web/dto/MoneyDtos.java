package com.dormming.web.dto;

import java.util.List;

public final class MoneyDtos {
    private MoneyDtos() {
    }

    public record PaymentRequest(String toUserId, Long amountCentavos, String note) {
    }

    public record DebtDto(UserRef user, long amountCentavos, String direction) {
    }

    public record BalancesDto(long owedToMeCentavos, long iOweCentavos, long netCentavos, List<DebtDto> debts) {
    }
}
