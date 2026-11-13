package com.dormming.service;

import com.dormming.model.Ledger;
import com.dormming.repository.TransactionRepository;
import org.springframework.stereotype.Service;

@Service
public class BalanceService {

    private final TransactionRepository transactions;

    public BalanceService(TransactionRepository transactions) {
        this.transactions = transactions;
    }

    public Ledger ledgerFor(String dormId) {
        return new Ledger(transactions.sharedByDorm(dormId), transactions.paymentsByDorm(dormId));
    }
}
