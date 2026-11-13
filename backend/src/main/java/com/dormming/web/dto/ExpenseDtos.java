package com.dormming.web.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public final class ExpenseDtos {
    private ExpenseDtos() {
    }

    public record ItemRequest(String name, Long priceCentavos, List<String> sharerIds) {
    }

    public record SplitRequest(String type, Map<String, Long> amounts, List<ItemRequest> items, Long extrasCentavos) {
    }

    public record SharedRequest(Long amountCentavos, String category, String note, LocalDate date, String payerId,
            List<String> participantIds, SplitRequest split) {
    }

    public record ShareDto(UserRef user, long amountCentavos) {
    }

    public record ItemDto(String name, long priceCentavos, List<UserRef> sharers) {
    }

    public record ExpenseDto(String id, long amountCentavos, String category, String categoryLabel,
            String note, LocalDate date, UserRef createdBy, UserRef payer, String splitType, List<ShareDto> shares,
            List<ItemDto> items, long extrasCentavos, boolean canEdit, String text) {
    }
}
