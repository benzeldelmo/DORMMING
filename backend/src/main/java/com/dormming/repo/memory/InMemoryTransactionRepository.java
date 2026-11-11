package com.dormming.repo.memory;

import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Payment;
import com.dormming.domain.transaction.PersonalExpense;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import com.dormming.repo.TransactionRepository;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Repository;

@Repository
@Profile("local")
public class InMemoryTransactionRepository implements TransactionRepository {

    private final Map<String, Transaction> transactions = new ConcurrentHashMap<>();

    @Override
    public Transaction save(Transaction transaction) {
        transactions.put(transaction.id(), transaction);
        return transaction;
    }

    @Override
    public Optional<Transaction> findById(String id) {
        return Optional.ofNullable(transactions.get(id));
    }

    @Override
    public void delete(String id) {
        transactions.remove(id);
    }

    private <T extends Transaction> List<T> ofType(Class<T> type, String dormId) {
        return transactions.values().stream().filter(type::isInstance).map(type::cast)
                .filter(t -> Objects.equals(t.dormId(), dormId)).toList();
    }

    @Override
    public List<PersonalExpense> personalByUser(UserId user) {
        return transactions.values().stream().filter(PersonalExpense.class::isInstance).map(PersonalExpense.class::cast)
                .filter(t -> t.createdBy().equals(user)).toList();
    }

    @Override
    public List<SharedExpense> sharedByDorm(String dormId) {
        return ofType(SharedExpense.class, dormId);
    }

    @Override
    public List<Payment> paymentsByDorm(String dormId) {
        return ofType(Payment.class, dormId);
    }

    @Override
    public List<Bill> billsByDorm(String dormId) {
        return ofType(Bill.class, dormId);
    }
}
