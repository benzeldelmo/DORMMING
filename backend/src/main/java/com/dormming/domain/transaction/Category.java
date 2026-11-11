package com.dormming.domain.transaction;

public enum Category {
    FOOD_GROCERIES("Food & Groceries"),
    RENT_UTILITIES("Rent & Utilities"),
    INTERNET_LOAD("Internet & Load"),
    TRANSPORTATION("Transportation"),
    SCHOOL("School"),
    PERSONAL_CARE("Personal Care"),
    HEALTH("Health"),
    LEISURE("Leisure"),
    OTHERS("Others");

    private final String label;

    Category(String label) {
        this.label = label;
    }

    public String label() {
        return label;
    }
}
