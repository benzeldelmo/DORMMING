package com.dormming.service;

import com.dormming.domain.user.FriendCode;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.FriendRepository;
import com.dormming.repo.UserRepository;
import java.util.Comparator;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class FriendService {

    private final UserRepository users;
    private final FriendRepository friends;

    public FriendService(UserRepository users, FriendRepository friends) {
        this.users = users;
        this.friends = friends;
    }

    /** Scanning or opening a card's QR connects both people straight away. */
    public User connect(UserId me, String friendCode) {
        User friend = users.findByFriendCode(FriendCode.parse(friendCode))
                .orElseThrow(() -> new NotFoundException("No one has that card code"));
        if (friend.id().equals(me)) {
            throw new IllegalArgumentException("That's your own card");
        }
        friends.connect(me, friend.id());
        return friend;
    }

    public List<User> friends(UserId me) {
        return users.findAllById(friends.friendsOf(me)).stream()
                .sorted(Comparator.comparing(User::displayName)).toList();
    }
}
