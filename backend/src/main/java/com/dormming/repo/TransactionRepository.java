package com.dormming.repo;

import com.dormming.domain.transaction.Bill;
import com.dormming.domain.transaction.Payment;
import com.dormming.domain.transaction.PersonalExpense;
import com.dormming.domain.transaction.SharedExpense;
import com.dormming.domain.transaction.Transaction;
import com.dormming.domain.user.UserId;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository {
    Transaction save(Transaction transaction);

    Optional<Transaction> findById(String id);

    void delete(String id);

    List<PersonalExpense> personalByUser(UserId user);

    List<SharedExpense> sharedByDorm(String dormId);

    List<Payment> paymentsByDorm(String dormId);

    List<Bill> billsByDorm(String dormId);
}
