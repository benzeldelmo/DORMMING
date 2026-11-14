package com.dormming.model;

/** {@code from} owes {@code to} this amount. */
public record Debt(UserId from, UserId to, Money amount) {
}
