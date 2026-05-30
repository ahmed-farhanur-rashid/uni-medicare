package com.uni.medicare.lab;

import com.uni.medicare.billing.Service;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "lab_test_catalog")
@Getter @Setter
public class LabTestCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer catalogId;

    @Column(nullable = false, unique = true, length = 150)
    private String testName;

    @Column(length = 255)
    private String description;

    @Column(length = 100)
    private String normalRange;

    @Column(length = 50)
    private String unit;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private Service service;
}
