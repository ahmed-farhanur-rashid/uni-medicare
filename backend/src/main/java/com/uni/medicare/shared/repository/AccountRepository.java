package com.uni.medicare.shared.repository;

import com.uni.medicare.shared.entity.Account;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AccountRepository extends JpaRepository<Account, Integer> {}
