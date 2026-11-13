package com.dormming.repo;

import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface UserRepository {
    User save(User user);

    Optional<User> findById(UserId id);

    Optional<User> findByEmail(String email);

    List<User> findAllById(Collection<UserId> ids);

    void delete(UserId id);
}
