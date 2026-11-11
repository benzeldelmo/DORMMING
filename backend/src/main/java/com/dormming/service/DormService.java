package com.dormming.service;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.dorm.DormInvite;
import com.dormming.domain.dorm.DormMember;
import com.dormming.domain.dorm.InviteCode;
import com.dormming.domain.user.UserId;
import com.dormming.repo.DormRepository;
import com.dormming.repo.FriendRepository;
import com.dormming.repo.InviteRepository;
import com.dormming.repo.UserRepository;
import java.time.Clock;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.random.RandomGenerator;
import org.springframework.stereotype.Service;

@Service
public class DormService {

    private final DormRepository dorms;
    private final UserRepository users;
    private final FriendRepository friends;
    private final InviteRepository invites;
    private final BalanceService balances;
    private final RandomGenerator random;
    private final Clock clock;

    public DormService(DormRepository dorms, UserRepository users, FriendRepository friends, InviteRepository invites,
            BalanceService balances, RandomGenerator random, Clock clock) {
        this.dorms = dorms;
        this.users = users;
        this.friends = friends;
        this.invites = invites;
        this.balances = balances;
        this.random = random;
        this.clock = clock;
    }

    public Optional<Dorm> current(UserId user) {
        return dorms.findByMember(user);
    }

    /** The caller's dorm, or 404 if they haven't joined one. */
    public Dorm require(UserId user) {
        return current(user).orElseThrow(() -> new NotFoundException("Join or create a dorm first"));
    }

    public DormMember memberOf(Dorm dorm, UserId user) {
        return dorm.memberOf(user).orElseThrow(() -> new NotAllowedException("You're not in this dorm"));
    }

    private void requireNoDorm(UserId user) {
        if (current(user).isPresent()) {
            throw new IllegalArgumentException("Leave your current dorm first");
        }
    }

    private InviteCode freshCode() {
        InviteCode code;
        do {
            code = InviteCode.generate(random);
        } while (dorms.findByCode(code).isPresent());
        return code;
    }

    public Dorm create(UserId user, String name) {
        requireNoDorm(user);
        return dorms.save(Dorm.create(name, user, freshCode(), clock.instant()));
    }

    public Dorm join(UserId user, String code) {
        requireNoDorm(user);
        Dorm dorm = dorms.findByCode(InviteCode.parse(code))
                .orElseThrow(() -> new NotFoundException("No dorm has that code"));
        dorm.addMember(user, clock.instant());
        return dorms.save(dorm);
    }

    private void requireSettled(Dorm dorm, UserId user, String message) {
        if (!balances.ledgerFor(dorm.id()).isSettled(user)) {
            throw new IllegalArgumentException(message);
        }
    }

    public void leave(UserId user) {
        Dorm dorm = require(user);
        requireSettled(dorm, user, "Settle your balance before leaving");
        dorm.removeMember(user);
        if (dorm.isEmpty()) {
            dorms.delete(dorm.id());
        } else {
            dorms.save(dorm);
        }
    }

    public Dorm removeMember(UserId actor, UserId target) {
        Dorm dorm = require(actor);
        if (!memberOf(dorm, actor).canRemoveMembers()) {
            throw new NotAllowedException("Only the dorm creator can remove members");
        }
        if (actor.equals(target)) {
            throw new IllegalArgumentException("Use Leave dorm to remove yourself");
        }
        if (!dorm.hasMember(target)) {
            throw new NotFoundException("That person isn't in your dorm");
        }
        requireSettled(dorm, target, "They need to settle their balance first");
        dorm.removeMember(target);
        return dorms.save(dorm);
    }

    public Dorm regenerateCode(UserId actor) {
        Dorm dorm = require(actor);
        if (!memberOf(dorm, actor).canRegenerateCode()) {
            throw new NotAllowedException("Only the dorm creator can make a new code");
        }
        dorm.regenerateCode(freshCode());
        return dorms.save(dorm);
    }

    public void inviteFriend(UserId actor, UserId friend) {
        Dorm dorm = require(actor);
        if (!memberOf(dorm, actor).canInviteFriends()) {
            throw new NotAllowedException("You can't invite people to this dorm");
        }
        if (!friends.friendsOf(actor).contains(friend)) {
            throw new IllegalArgumentException("You can only invite your friends");
        }
        if (current(friend).isPresent()) {
            throw new IllegalArgumentException("Your friend is already in a dorm");
        }
        boolean alreadyInvited = invites.forUser(friend).stream().anyMatch(i -> i.dormId().equals(dorm.id()));
        if (!alreadyInvited) {
            invites.save(new DormInvite(UUID.randomUUID().toString(), dorm.id(), actor, friend, clock.instant()));
        }
    }

    /** Invites whose dorm still exists. */
    public List<DormInvite> invitesFor(UserId user) {
        return invites.forUser(user).stream().filter(i -> dorms.findById(i.dormId()).isPresent()).toList();
    }

    public Dorm acceptInvite(UserId user, String inviteId) {
        DormInvite invite = invites.findById(inviteId).filter(i -> i.to().equals(user))
                .orElseThrow(() -> new NotFoundException("Invite not found"));
        requireNoDorm(user);
        Dorm dorm = dorms.findById(invite.dormId()).orElseThrow(() -> new NotFoundException("That dorm no longer exists"));
        dorm.addMember(user, clock.instant());
        invites.forUser(user).forEach(i -> invites.delete(i.id()));
        return dorms.save(dorm);
    }

    public String nameOf(UserId user) {
        return users.findById(user).map(u -> u.displayName()).orElse("Someone");
    }
}
