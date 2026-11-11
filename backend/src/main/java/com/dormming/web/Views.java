package com.dormming.web;

import com.dormming.domain.dorm.Dorm;
import com.dormming.domain.dorm.DormInvite;
import com.dormming.domain.user.User;
import com.dormming.domain.user.UserId;
import com.dormming.repo.DormRepository;
import com.dormming.repo.UserRepository;
import com.dormming.web.dto.DormDtos.DormDto;
import com.dormming.web.dto.DormDtos.InviteDto;
import com.dormming.web.dto.DormDtos.MemberDto;
import com.dormming.web.dto.UserRef;
import java.util.Collection;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

/** Builds response objects, looking up names for user ids. */
@Component
public class Views {

    private final UserRepository users;
    private final DormRepository dorms;
    private final String appBaseUrl;

    public Views(UserRepository users, DormRepository dorms, @Value("${dormming.app-base-url}") String appBaseUrl) {
        this.users = users;
        this.dorms = dorms;
        this.appBaseUrl = appBaseUrl;
    }

    public String appBaseUrl() {
        return appBaseUrl;
    }

    public Map<UserId, User> usersById(Collection<UserId> ids) {
        return users.findAllById(ids).stream().collect(Collectors.toMap(User::id, Function.identity()));
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
        return new DormDto(dorm.id(), dorm.name(), dorm.code().value(), appBaseUrl + "/join/" + dorm.code().value(),
                members, myRole);
    }

    public InviteDto invite(DormInvite invite) {
        String dormName = dorms.findById(invite.dormId()).map(Dorm::name).orElse("A dorm");
        return new InviteDto(invite.id(), dormName, ref(invite.from()));
    }
}
