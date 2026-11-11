package com.dormming.domain.dorm;

import com.dormming.domain.user.UserId;
import java.time.Instant;

public record DormInvite(String id, String dormId, UserId from, UserId to, Instant createdAt) {
}
