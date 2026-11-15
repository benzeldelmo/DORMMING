package com.dormming.repository.memory;

import com.dormming.model.Bill;
import com.dormming.model.UserId;
import com.dormming.repository.BillRepository;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryBillRepository implements BillRepository {

    private final Map<String, Bill> bills = new ConcurrentHashMap<>();

    @Override
    public Bill save(Bill bill) {
        bills.put(bill.id(), bill);
        return bill;
    }

    @Override
    public Optional<Bill> findById(String id) {
        return Optional.ofNullable(bills.get(id));
    }

    @Override
    public List<Bill> findByOwner(UserId owner) {
        return bills.values().stream().filter(b -> b.owner().equals(owner)).toList();
    }

    @Override
    public void delete(String id) {
        bills.remove(id);
    }
}
