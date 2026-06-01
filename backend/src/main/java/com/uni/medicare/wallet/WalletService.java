package com.uni.medicare.wallet;

import com.uni.medicare.auth.StudentRepository;
import com.uni.medicare.billing.Transaction;
import com.uni.medicare.shared.entity.Account;
import com.uni.medicare.shared.entity.Student;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final StudentRepository studentRepo;
    private final EntityManager em;

    @Transactional(readOnly = true)
    public BigDecimal getBalance(int studentId) {
        Student student = studentRepo.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        return student.getAccount().getBalance();
    }

    @Transactional
    public Account topUp(int studentId, BigDecimal amount) {
        Student student = studentRepo.findByStudentId(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        Account account = student.getAccount();
        account.setBalance(account.getBalance().add(amount));
        em.merge(account);

        Transaction tx = new Transaction();
        tx.setAccount(account);
        tx.setTransType("wallet_topup");
        tx.setAmount(amount);
        tx.setReferenceNote("Wallet top-up via payment gateway");
        em.persist(tx);

        return account;
    }
}
