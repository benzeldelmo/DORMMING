package com.dormming.service;

import com.dormming.model.Dorm;
import com.dormming.model.DormMember;
import com.dormming.model.InviteCode;
import com.dormming.model.UserId;
import com.dormming.repository.DormRepository;
import com.dormming.service.exception.NotAllowedException;
import com.dormming.service.exception.NotFoundException;
import java.time.Clock;
import java.util.Optional;
import java.util.random.RandomGenerator;
import org.springframework.stereotype.Service;

@Service
public class DormService {

    private final DormRepository dorms;
    private final BalanceService balances;
    private final RandomGenerator random;
    private final Clock clock;

    public DormService(DormRepository dorms, BalanceService balances, RandomGenerator random, Clock clock) {
        this.dorms = dorms;
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
}
