package com.dormming.repository;

import com.dormming.model.User;
import com.dormming.model.UserId;
import java.util.Optional;

public interface UserRepository {
    User save(User user);

    Optional<User> findById(UserId id);

    Optional<User> findByEmail(String email);
}
