package com.uni.medicare.vital;

import com.uni.medicare.consultation.Consultation;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;

@Entity
@Table(name = "vital_signs")
@Getter @Setter
public class VitalSign {

    // PK = FK to consultation (one-to-one)
    @Id
    private Integer consultId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "consult_id")
    private Consultation consultation;

    @Column(length = 20)
    private String bp;

    private Integer pulse;

    @Column(precision = 4, scale = 1)
    private BigDecimal temp;

    private Integer respiratoryRate;

    @Column(precision = 5, scale = 2)
    private BigDecimal oxygenSaturation;

    @Column(precision = 6, scale = 2)
    private BigDecimal bloodGlucose;

    @Column(precision = 5, scale = 2)
    private BigDecimal weight;

    @Column(precision = 5, scale = 2)
    private BigDecimal height;

    // Generated column — PostgreSQL computes from weight/height; never write from Java
    @Column(precision = 4, scale = 2, insertable = false, updatable = false)
    private BigDecimal bmi;
}
