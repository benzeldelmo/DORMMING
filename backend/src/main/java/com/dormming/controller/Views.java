package com.dormming.controller;

import com.dormming.controller.dto.DormDtos.DormDto;
import com.dormming.controller.dto.DormDtos.MemberDto;
import com.dormming.controller.dto.UserRef;
import com.dormming.model.Dorm;
import com.dormming.model.User;
import com.dormming.model.UserId;
import com.dormming.repository.UserRepository;
import java.util.function.Function;
import org.springframework.stereotype.Component;

/** Builds response objects, looking up names for user ids. */
@Component
public class Views {

    private final UserRepository users;

    public Views(UserRepository users) {
        this.users = users;
    }

    public UserRef ref(UserId id) {
        return users.findById(id).map(UserRef::of).orElse(new UserRef(id.value(), "Former member", "?", null));
    }

    public Function<UserId, String> names() {
        return id -> users.findById(id).map(User::displayName).orElse("Former member");
    }

    public DormDto dorm(Dorm dorm, UserId viewer) {
        var members = dorm.members().stream().map(m -> new MemberDto(
                users.findById(m.userId()).map(UserRef::withPhoto).orElse(ref(m.userId())), m.role(), m.joinedAt())).toList();
        String myRole = dorm.memberOf(viewer).map(m -> m.role()).orElse(null);
        return new DormDto(dorm.id(), dorm.name(), dorm.code().value(), members, myRole);
    }
}
