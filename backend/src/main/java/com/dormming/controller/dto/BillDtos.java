package com.dormming.controller.dto;

import java.time.LocalDate;

public final class BillDtos {
    private BillDtos() {
    }

    public record BillRequest(String name, Long amountCentavos, LocalDate dueDate, boolean monthly) {
    }

    public record BillDto(String id, String name, long amountCentavos, LocalDate dueDate, boolean monthly) {
    }
}
