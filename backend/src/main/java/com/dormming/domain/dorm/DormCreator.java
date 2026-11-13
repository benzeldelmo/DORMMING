package com.dormming.domain.dorm;

import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import java.time.Instant;

/** Inheritance: a creator is a member who may delete any record in the dorm. */
public class DormCreator extends DormMember {

    public DormCreator(UserId userId, Instant joinedAt) {
        super(userId, joinedAt);
    }

    @Override
    public boolean canEdit(Transaction transaction) {
        return true;
    }

    @Override
    public String role() {
        return "CREATOR";
    }
}
