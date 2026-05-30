package com.uni.medicare.prescription;

import com.uni.medicare.consultation.Consultation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "prescriptions")
@Getter @Setter
public class Prescription {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer prescriptionId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consult_id", nullable = false)
    private Consultation consultation;

    @Column(nullable = false)
    private LocalDateTime prescriptionDate;

    @Column(columnDefinition = "TEXT")
    private String chiefComplaint;

    @Column(columnDefinition = "TEXT")
    private String diagnosis;

    private LocalDate followUpDate;

    @PrePersist
    protected void onCreate() {
        if (prescriptionDate == null) prescriptionDate = LocalDateTime.now();
    }
}
