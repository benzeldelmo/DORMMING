package com.dormming.repository;

import com.dormming.model.Dorm;
import com.dormming.model.InviteCode;
import com.dormming.model.UserId;
import java.util.Optional;

public interface DormRepository {
    Dorm save(Dorm dorm);

    Optional<Dorm> findById(String id);

    Optional<Dorm> findByCode(InviteCode code);

    Optional<Dorm> findByMember(UserId user);

    void delete(String id);
}
