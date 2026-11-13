package com.dormming.web;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.UserRepository;
import com.dormming.web.dto.DormDtos.DormDto;
import com.dormming.web.dto.DormDtos.MemberDto;
import com.dormming.web.dto.UserRef;
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
        return users.findById(id).map(UserRef::of).orElse(new UserRef(id.value(), "Former member", "?"));
    }

    public Function<UserId, String> names() {
        return id -> users.findById(id).map(User::displayName).orElse("Former member");
    }

    public DormDto dorm(Dorm dorm, UserId viewer) {
        var members = dorm.members().stream().map(m -> new MemberDto(ref(m.userId()), m.role(), m.joinedAt())).toList();
        String myRole = dorm.memberOf(viewer).map(m -> m.role()).orElse(null);
        return new DormDto(dorm.id(), dorm.name(), dorm.code().value(), members, myRole);
    }
}
