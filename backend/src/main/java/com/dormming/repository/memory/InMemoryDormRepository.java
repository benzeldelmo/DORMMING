package com.dormming.repository.memory;

import com.dormming.model.Dorm;
import com.dormming.model.InviteCode;
import com.dormming.model.UserId;
import com.dormming.repository.DormRepository;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
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
