package com.dormming.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

/** A dorm and its members, kept in the order they joined. */
public class Dorm {

    private final String id;
    private final String name;
    private InviteCode code;
    private final List<DormMember> members;

    public Dorm(String id, String name, InviteCode code, List<DormMember> members) {
        String trimmed = name == null ? "" : name.strip();
        if (trimmed.isEmpty() || trimmed.length() > 40) {
            throw new IllegalArgumentException("Dorm name must be 1 to 40 characters");
        }
        this.id = id == null ? UUID.randomUUID().toString() : id;
        this.name = trimmed;
        this.code = code;
        this.members = new ArrayList<>(members);
    }

    public static Dorm create(String name, UserId creator, InviteCode code, Instant now) {
        return new Dorm(null, name, code, List.of(new DormCreator(creator, now)));
    }

    public String id() {
        return id;
    }

    public String name() {
        return name;
    }

    public InviteCode code() {
        return code;
    }

    public List<DormMember> members() {
        return List.copyOf(members);
    }

    public List<UserId> memberIdsInJoinOrder() {
        return members.stream().map(DormMember::userId).toList();
    }

    public Optional<DormMember> memberOf(UserId user) {
        return members.stream().filter(m -> m.userId().equals(user)).findFirst();
    }

    public boolean hasMember(UserId user) {
        return memberOf(user).isPresent();
    }

    public void addMember(UserId user, Instant now) {
        if (hasMember(user)) {
            throw new IllegalArgumentException("Already in this dorm");
        }
        members.add(new DormMember(user, now));
    }

    /** Removes someone. If they were the creator, the next member by join order takes over. */
    public void removeMember(UserId user) {
        DormMember leaving = memberOf(user).orElseThrow(() -> new IllegalArgumentException("Not in this dorm"));
        members.remove(leaving);
        if (leaving instanceof DormCreator && !members.isEmpty()) {
            DormMember next = members.getFirst();
            members.set(0, new DormCreator(next.userId(), next.joinedAt()));
        }
    }

    public boolean isEmpty() {
        return members.isEmpty();
    }

    public void regenerateCode(InviteCode newCode) {
        this.code = newCode;
    }
}
