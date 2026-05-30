package com.uni.medicare.lab;

import com.uni.medicare.prescription.Prescription;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "prescription_lab_tests")
@Getter @Setter
public class PrescriptionLabTest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer labTestId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "prescription_id", nullable = false)
    private Prescription prescription;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id")
    private LabTestCatalog catalog;

    // Free-text fallback if not in catalog
    @Column(length = 100)
    private String labTestName;

    @OneToOne(mappedBy = "labTest", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private LabResult labResult;
}
