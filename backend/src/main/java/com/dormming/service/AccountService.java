package com.dormming.service;

import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.repository.BillRepository;
import com.dormming.repository.UserRepository;
import com.dormming.service.exception.UnauthorizedException;
import org.springframework.stereotype.Service;

/** Your account: set or remove your profile photo, or delete it (leave the dorm when settled up, drop your bills, then the user). */
@Service
public class AccountService {

    private final UserRepository users;
    private final DormService dorms;
    private final BillRepository bills;

    public AccountService(UserRepository users, DormService dorms, BillRepository bills) {
        this.users = users;
        this.dorms = dorms;
        this.bills = bills;
    }

    /** Saves a new profile photo (a small image data URL), or removes it when {@code photo} is null. */
    public User setPhoto(UserId id, String photo) {
        User user = users.findById(id).orElseThrow(() -> new UnauthorizedException("Please log in again"));
        return users.save(user.withPhoto(photo));
    }

    /** Returns the deleted user, so the caller can also forget their login. */
    public User delete(UserId id) {
        User user = users.findById(id).orElseThrow(() -> new UnauthorizedException("Please log in again"));
        if (dorms.current(id).isPresent()) {
            dorms.leave(id); // throws "Settle your balance before leaving" while money is open
        }
        bills.findByOwner(id).forEach(b -> bills.delete(b.id()));
        users.delete(id);
        return user;
    }
}
