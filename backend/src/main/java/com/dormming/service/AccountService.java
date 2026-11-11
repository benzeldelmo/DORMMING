package com.dormming.service;

import com.dormming.auth.CredentialStore;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.FriendRepository;
import com.dormming.repo.InviteRepository;
import com.dormming.repo.UserRepository;
import java.util.Optional;
import org.springframework.stereotype.Service;

/** Deleting an account: leave the dorm (only when settled), drop friends, invites and the login. */
@Service
public class AccountService {

    private final DormService dorms;
    private final UserRepository users;
    private final FriendRepository friends;
    private final InviteRepository invites;
    private final Optional<CredentialStore> credentials;

    public AccountService(DormService dorms, UserRepository users, FriendRepository friends, InviteRepository invites,
            Optional<CredentialStore> credentials) {
        this.dorms = dorms;
        this.users = users;
        this.friends = friends;
        this.invites = invites;
        this.credentials = credentials;
    }

    public void delete(UserId id) {
        User user = users.findById(id).orElseThrow(() -> new UnauthorizedException("Please log in again"));
        if (dorms.current(id).isPresent()) {
            dorms.leave(id); // throws "Settle your balance before leaving" while money is open
        }
        friends.removeAll(id);
        invites.forUser(id).forEach(i -> invites.delete(i.id()));
        credentials.ifPresent(c -> c.remove(user.email()));
        users.delete(id);
    }
}
