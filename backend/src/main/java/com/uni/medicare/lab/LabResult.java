package com.uni.medicare.lab;

import com.uni.medicare.shared.entity.MedicalStaff;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_results")
@Getter @Setter
public class LabResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer resultId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lab_test_id", nullable = false)
    private PrescriptionLabTest labTest;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by")
    private MedicalStaff performedBy;

    @Column(length = 255)
    private String resultValue;

    @Column(columnDefinition = "TEXT")
    private String resultNotes;

    // pending | in_progress | completed | cancelled
    @Column(nullable = false, length = 20)
    private String resultStatus = "pending";

    private LocalDateTime resultedAt;

    @Column(name = "upload_id")
    private Integer uploadId;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
