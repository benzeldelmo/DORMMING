package com.dormming.repository.memory;

import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.repository.UserRepository;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryUserRepository implements UserRepository {

    private final Map<UserId, User> users = new ConcurrentHashMap<>();

    @Override
    public User save(User user) {
        users.put(user.id(), user);
        return user;
    }

    @Override
    public Optional<User> findById(UserId id) {
        return Optional.ofNullable(users.get(id));
    }

    @Override
    public Optional<User> findByEmail(String email) {
        return users.values().stream().filter(u -> u.email().equalsIgnoreCase(email.strip())).findFirst();
    }

    @Override
    public void delete(UserId id) {
        users.remove(id);
    }

    @Override
    public List<User> findAllById(Collection<UserId> ids) {
        return ids.stream().map(users::get).filter(u -> u != null).toList();
    }
}
