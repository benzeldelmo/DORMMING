package com.dormming.repo.memory;

import com.dormming.domain.dorm.DormInvite;
import com.dormming.domain.user.UserId;
import com.dormming.repo.InviteRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("local")
public class InMemoryInviteRepository implements InviteRepository {

    private final Map<String, DormInvite> invites = new ConcurrentHashMap<>();

    @Override
    public DormInvite save(DormInvite invite) {
        invites.put(invite.id(), invite);
        return invite;
    }

    @Override
    public List<DormInvite> forUser(UserId user) {
        return invites.values().stream().filter(i -> i.to().equals(user)).toList();
    }

    @Override
    public Optional<DormInvite> findById(String id) {
        return Optional.ofNullable(invites.get(id));
    }

    @Override
    public void delete(String id) {
        invites.remove(id);
    }
}
