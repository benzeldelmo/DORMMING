package com.dormming.controller.dto;

import java.time.Instant;
import java.util.List;

public final class DormDtos {
    private DormDtos() {
    }

    public record MemberDto(UserRef user, String role, Instant joinedAt) {
    }

    public record DormDto(String id, String name, String inviteCode, List<MemberDto> members,
            String myRole) {
    }

    public record CreateDormRequest(String name) {
    }

    public record JoinRequest(String code) {
    }
}
