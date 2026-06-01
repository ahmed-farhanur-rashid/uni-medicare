package com.uni.medicare.shared.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Entity
@Table(name = "department_schedules")
@Getter @Setter
public class DepartmentSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer scheduleId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "department_id", nullable = false, unique = true)
    private Department department;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes = 20;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime = LocalTime.of(8, 0);

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime = LocalTime.of(17, 0);

    @Column(name = "break_start", nullable = false)
    private LocalTime breakStart = LocalTime.of(13, 0);

    @Column(name = "break_end", nullable = false)
    private LocalTime breakEnd = LocalTime.of(13, 30);

    @Column(name = "is_bookable", nullable = false)
    private Boolean isBookable = true;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
