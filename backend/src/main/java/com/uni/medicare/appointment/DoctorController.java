package com.uni.medicare.appointment;

import com.uni.medicare.admin.StaffAdminRepository;
import com.uni.medicare.department.DepartmentScheduleService;
import com.uni.medicare.shared.dto.DoctorResponse;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.StaffSchedule;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/doctors")
@RequiredArgsConstructor
public class DoctorController {

    private final StaffAdminRepository staffRepo;
    private final DepartmentScheduleService scheduleService;
    private final EntityManager em;

    @GetMapping("/specialties")
    public List<String> specialties() {
        return staffRepo.findAll().stream()
                .filter(s -> s.getRole() != null && "DOCTOR".equals(s.getRole().getRoleName()))
                .map(MedicalStaff::getSpecialty)
                .filter(java.util.Objects::nonNull)
                .filter(s -> !s.isBlank())
                .distinct()
                .sorted()
                .toList();
    }

    @GetMapping
    public List<DoctorResponse> doctors(@RequestParam(required = false) String specialty) {
        return staffRepo.findAll().stream()
                .filter(s -> s.getRole() != null && "DOCTOR".equals(s.getRole().getRoleName()))
                .filter(MedicalStaff::getIsActive)
                .filter(s -> specialty == null || specialty.isBlank() || specialty.equals(s.getSpecialty()))
                .map(DoctorResponse::fromEntity)
                .toList();
    }

    @GetMapping("/{id}/schedule")
    public List<Map<String, Object>> schedule(@PathVariable int id) {
        List<StaffSchedule> schedules = em.createQuery(
                "SELECT s FROM StaffSchedule s WHERE s.medicalStaff.medicalStaffId = :id ORDER BY s.dayOfWeek",
                StaffSchedule.class)
                .setParameter("id", id)
                .getResultList();
        return schedules.stream().map(s -> {
            Map<String, Object> map = new java.util.LinkedHashMap<>();
            map.put("scheduleId", s.getScheduleId());
            map.put("dayOfWeek", s.getDayOfWeek());
            map.put("startTime", s.getStartTime().toString());
            map.put("endTime", s.getEndTime().toString());
            return map;
        }).toList();
    }

    @GetMapping("/{id}/available-slots")
    public List<Map<String, Object>> availableSlots(
            @PathVariable int id,
            @RequestParam String date) {
        LocalDate d = LocalDate.parse(date);
        return scheduleService.getAvailableSlots(id, d);
    }
}
