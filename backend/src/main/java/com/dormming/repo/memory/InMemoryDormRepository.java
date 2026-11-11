package com.dormming.repo.memory;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.dorm.InviteCode;
import com.dormming.domain.user.UserId;
import com.dormming.repo.DormRepository;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("local")
public class InMemoryDormRepository implements DormRepository {

    private final Map<String, Dorm> dorms = new ConcurrentHashMap<>();

    @Override
    public Dorm save(Dorm dorm) {
        dorms.put(dorm.id(), dorm);
        return dorm;
    }

    @Override
    public Optional<Dorm> findById(String id) {
        return Optional.ofNullable(dorms.get(id));
    }

    @Override
    public Optional<Dorm> findByCode(InviteCode code) {
        return dorms.values().stream().filter(d -> d.code().equals(code)).findFirst();
    }

    @Override
    public Optional<Dorm> findByMember(UserId user) {
        return dorms.values().stream().filter(d -> d.hasMember(user)).findFirst();
    }

    @Override
    public void delete(String id) {
        dorms.remove(id);
    }
}
