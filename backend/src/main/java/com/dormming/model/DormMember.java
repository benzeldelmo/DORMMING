package com.dormming.model;

import java.time.Instant;

/** Someone in a dorm. Members can add records and delete their own. */
public class DormMember {

    private final UserId userId;
    private final Instant joinedAt;

    public DormMember(UserId userId, Instant joinedAt) {
        this.userId = userId;
        this.joinedAt = joinedAt;
    }

    public UserId userId() {
        return userId;
    }

    public Instant joinedAt() {
        return joinedAt;
    }

    public boolean canEdit(Transaction transaction) {
        return transaction.createdBy().equals(userId);
    }

    public String role() {
        return "MEMBER";
    }
}
