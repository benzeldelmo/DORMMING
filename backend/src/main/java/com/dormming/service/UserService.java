package com.dormming.service;

import com.dormming.domain.user.CardColor;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService {

    private final UserRepository users;

    public UserService(UserRepository users) {
        this.users = users;
    }

    public User get(UserId id) {
        return users.findById(id).orElseThrow(() -> new NotFoundException("Account not found"));
    }

    /** Null fields are left unchanged. */
    public User update(UserId id, String displayName, String mingName, CardColor color) {
        User user = get(id);
        if (displayName != null) {
            user = user.withDisplayName(displayName);
        }
        if (mingName != null) {
            user = user.withMingName(mingName);
        }
        if (color != null) {
            user = user.withCardColor(color);
        }
        return users.save(user);
    }
}
