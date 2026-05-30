package com.uni.medicare.shared.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "medical_staff_roles")
@Getter @Setter
public class MedicalStaffRole {

    @Id
    private Integer roleId;

    @Column(length = 100)
    private String roleName;

    @Column(nullable = false)
    private Boolean canPrescribe;
}
