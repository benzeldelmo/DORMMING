package com.dormming.repository;

import com.dormming.model.Bill;
import com.dormming.model.UserId;
import java.util.List;
import java.util.Optional;

public interface BillRepository {
    Bill save(Bill bill);

    Optional<Bill> findById(String id);

    List<Bill> findByOwner(UserId owner);

    void delete(String id);
}
