package com.dormming.repo.memory;

import com.dormming.domain.user.UserId;
import com.dormming.repo.FriendRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArraySet;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("local")
public class InMemoryFriendRepository implements FriendRepository {

    private final Map<UserId, Set<UserId>> friends = new ConcurrentHashMap<>();

    @Override
    public void connect(UserId a, UserId b) {
        friends.computeIfAbsent(a, k -> new CopyOnWriteArraySet<>()).add(b);
        friends.computeIfAbsent(b, k -> new CopyOnWriteArraySet<>()).add(a);
    }

    @Override
    public void removeAll(UserId user) {
        friends.remove(user);
        friends.values().forEach(set -> set.remove(user));
    }

    @Override
    public List<UserId> friendsOf(UserId user) {
        return List.copyOf(friends.getOrDefault(user, Set.of()));
    }
}
