package com.uni.medicare.department;

import com.uni.medicare.appointment.AppointmentRepository;
import com.uni.medicare.shared.entity.Department;
import com.uni.medicare.shared.entity.DepartmentSchedule;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.repository.DepartmentScheduleRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentScheduleService {

    private final DepartmentScheduleRepository scheduleRepo;
    private final AppointmentRepository appointmentRepo;
    private final EntityManager em;

    public List<Map<String, Object>> getAll() {
        return scheduleRepo.findAll().stream().map(this::toMap).toList();
    }

    public Map<String, Object> getByDepartmentId(int departmentId) {
        DepartmentSchedule sched = scheduleRepo.findByDepartment_DepartmentId(departmentId)
                .orElseThrow(() -> new EntityNotFoundException("No schedule for department " + departmentId));
        return toMap(sched);
    }

    @Transactional
    public Map<String, Object> upsert(int departmentId, Map<String, Object> body) {
        Department dept = em.find(Department.class, departmentId);
        if (dept == null) throw new EntityNotFoundException("Department not found");

        DepartmentSchedule sched = scheduleRepo.findByDepartment_DepartmentId(departmentId)
                .orElse(new DepartmentSchedule());
        sched.setDepartment(dept);
        sched.setSlotDurationMinutes((Integer) body.getOrDefault("slotDurationMinutes", sched.getSlotDurationMinutes()));
        sched.setStartTime(parseTime(body.get("startTime"), sched.getStartTime()));
        sched.setEndTime(parseTime(body.get("endTime"), sched.getEndTime()));
        sched.setBreakStart(parseTime(body.get("breakStart"), sched.getBreakStart()));
        sched.setBreakEnd(parseTime(body.get("breakEnd"), sched.getBreakEnd()));
        sched.setIsBookable((Boolean) body.getOrDefault("isBookable", sched.getIsBookable()));
        scheduleRepo.save(sched);
        return toMap(sched);
    }

    @Transactional
    public void delete(int departmentId) {
        scheduleRepo.findByDepartment_DepartmentId(departmentId)
                .ifPresent(scheduleRepo::delete);
    }

    public List<Map<String, Object>> getAvailableSlots(int doctorId, LocalDate date) {
        MedicalStaff doctor = em.find(MedicalStaff.class, doctorId);
        if (doctor == null || doctor.getDepartment() == null) return List.of();

        DepartmentSchedule sched = scheduleRepo
                .findByDepartment_DepartmentId(doctor.getDepartment().getDepartmentId())
                .orElse(null);
        if (sched == null || !sched.getIsBookable()) return List.of();

        int dayOfWeek = date.getDayOfWeek().getValue() % 7;
        boolean hasStaffSchedule = Boolean.TRUE.equals(em.createQuery("""
            SELECT COUNT(s) > 0 FROM StaffSchedule s
            WHERE s.medicalStaff.medicalStaffId = :id AND s.dayOfWeek = :day
        """, Boolean.class).setParameter("id", doctorId).setParameter("day", dayOfWeek).getSingleResult());
        if (!hasStaffSchedule) return List.of();

        int duration = sched.getSlotDurationMinutes();
        LocalTime workStart = sched.getStartTime();
        LocalTime workEnd = sched.getEndTime();
        LocalTime brkStart = sched.getBreakStart();
        LocalTime brkEnd = sched.getBreakEnd();

        Set<LocalTime> booked = appointmentRepo.findByMedicalStaff_MedicalStaffId(doctorId).stream()
                .filter(a -> a.getScheduledTime() != null && a.getScheduledTime().toLocalDate().equals(date))
                .filter(a -> !"cancelled".equals(a.getStatus()) && !"no_show".equals(a.getStatus()))
                .map(a -> a.getScheduledTime().toLocalTime())
                .collect(Collectors.toSet());

        List<Map<String, Object>> slots = new ArrayList<>();
        LocalTime cursor = workStart;
        while (cursor.plusMinutes(duration).isBefore(workEnd) || cursor.plusMinutes(duration).equals(workEnd)) {
            LocalTime slotEnd = cursor.plusMinutes(duration);
            boolean inBreak = cursor.isBefore(brkEnd) && slotEnd.isAfter(brkStart);
            boolean booked_ = booked.contains(cursor);
            String status;
            if (inBreak) status = "break";
            else if (booked_) status = "booked";
            else status = "available";

            Map<String, Object> slot = new LinkedHashMap<>();
            slot.put("time", cursor.format(DateTimeFormatter.ofPattern("HH:mm")));
            slot.put("endTime", slotEnd.format(DateTimeFormatter.ofPattern("HH:mm")));
            slot.put("status", status);
            slots.add(slot);
            cursor = slotEnd;
        }
        return slots;
    }

    private Map<String, Object> toMap(DepartmentSchedule s) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("scheduleId", s.getScheduleId());
        m.put("departmentId", s.getDepartment().getDepartmentId());
        m.put("departmentName", s.getDepartment().getName());
        m.put("slotDurationMinutes", s.getSlotDurationMinutes());
        m.put("startTime", s.getStartTime().toString());
        m.put("endTime", s.getEndTime().toString());
        m.put("breakStart", s.getBreakStart().toString());
        m.put("breakEnd", s.getBreakEnd().toString());
        m.put("isBookable", s.getIsBookable());
        return m;
    }

    private LocalTime parseTime(Object val, LocalTime fallback) {
        if (val == null) return fallback;
        try { return LocalTime.parse(val.toString()); } catch (Exception e) { return fallback; }
    }
}
