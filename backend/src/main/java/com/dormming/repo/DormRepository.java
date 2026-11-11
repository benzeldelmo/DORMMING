package com.dormming.repo;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.dorm.InviteCode;
import com.dormming.domain.user.UserId;
import java.util.Optional;

public interface DormRepository {
    Dorm save(Dorm dorm);

    Optional<Dorm> findById(String id);

    Optional<Dorm> findByCode(InviteCode code);

    Optional<Dorm> findByMember(UserId user);

    void delete(String id);
}
