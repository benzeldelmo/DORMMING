package com.dormming.web.dto;

import com.dormming.web.dto.DormDtos.DormDto;
import com.dormming.web.dto.ExpenseDtos.ActivityDto;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class MoneyDtos {
    private MoneyDtos() {
    }

    public record BillShareDto(UserRef user, long amountCentavos, boolean paid) {
    }

    public record BillDto(String id, String name, String category, String categoryLabel, long amountCentavos,
            LocalDate dueDate, String recurrence, int remindDaysBefore, Long myShareCentavos, boolean mySharePaid,
            boolean overdue, boolean dueSoon, List<BillShareDto> shares, boolean canEdit) {
    }

    public record BillRequest(String name, String category, Long amountCentavos, LocalDate dueDate, String recurrence,
            Integer remindDaysBefore, SplitBody split) {
    }

    public record SplitBody(String type, Map<String, Long> amounts) {
    }

    public record PaymentRequest(String toUserId, Long amountCentavos, String note) {
    }

    public record DebtDto(UserRef user, long amountCentavos, String direction) {
    }

    public record BalancesDto(long owedToMeCentavos, long iOweCentavos, long netCentavos, List<DebtDto> debts) {
    }

    public record BannerDto(String billId, String text, long myShareCentavos) {
    }

    public record HomeDto(MeDto me, DormDto dorm, String mood, String moodLine, BannerDto banner,
            long owedToMeCentavos, long iOweCentavos, List<BillDto> upcomingBills, List<ActivityDto> recent) {
    }
}
