package com.dormming.repo;

import com.dormming.domain.dorm.DormInvite;
import com.dormming.domain.user.UserId;
import java.util.List;
import java.util.Optional;

public interface InviteRepository {
    DormInvite save(DormInvite invite);

    List<DormInvite> forUser(UserId user);

    Optional<DormInvite> findById(String id);

    void delete(String id);
}
