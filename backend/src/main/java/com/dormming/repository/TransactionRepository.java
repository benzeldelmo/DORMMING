package com.dormming.repository;

import com.dormming.model.Payment;
import com.dormming.model.SharedExpense;
import com.dormming.model.Transaction;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    Transaction save(Transaction transaction);

    Optional<Transaction> findById(String id);

    void delete(String id);

    List<SharedExpense> sharedByDorm(String dormId);

    List<Payment> paymentsByDorm(String dormId);
}
