package com.dormming.model;

import java.time.Instant;

/** Inheritance: a creator is a member who may delete any record and rename the dorm. */
public class DormCreator extends DormMember {

    public DormCreator(UserId userId, Instant joinedAt) {
        super(userId, joinedAt);
    }

    @Override
    public boolean canEdit(Transaction transaction) {
        return true;
    }

    @Override
    public boolean canRename() {
        return true;
    }

    @Override
    public String role() {
        return "CREATOR";
    }
}
