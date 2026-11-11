package com.dormming.repo;

import com.dormming.domain.user.UserId;
import java.util.List;

public interface FriendRepository {
    /** Connects both ways; connecting twice changes nothing. */
    void connect(UserId a, UserId b);

    List<UserId> friendsOf(UserId user);
}
