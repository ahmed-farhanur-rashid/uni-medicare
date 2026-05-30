package com.uni.medicare.billing;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ServiceRepository extends JpaRepository<Service, Integer> {
}
