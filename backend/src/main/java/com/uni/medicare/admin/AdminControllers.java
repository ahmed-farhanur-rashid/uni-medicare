package com.uni.medicare.admin;

import com.uni.medicare.shared.entity.Department;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.StaffSchedule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

// ── Departments ───────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/admin/departments")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class DepartmentController {

    private final DepartmentRepository repo;

    @GetMapping          public List<Department> all()                       { return repo.findAll(); }
    @GetMapping("/{id}") public Department one(@PathVariable int id)         { return repo.findById(id).orElseThrow(); }
    @PostMapping         @Transactional
                         public Department create(@RequestBody Department d) { return repo.save(d); }
    @PutMapping("/{id}") @Transactional
                         public Department update(@PathVariable int id, @RequestBody Department d) {
                             d.setDepartmentId(id); return repo.save(d); }
    @DeleteMapping("/{id}") @Transactional
                         public void delete(@PathVariable int id)            { repo.deleteById(id); }
}

// ── Roles ─────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class RoleController {

    private final StaffRoleRepository repo;

    @GetMapping          public List<MedicalStaffRole> all()                          { return repo.findAll(); }
    @GetMapping("/{id}") public MedicalStaffRole one(@PathVariable int id)            { return repo.findById(id).orElseThrow(); }
    @PostMapping         @Transactional
                         public MedicalStaffRole create(@RequestBody MedicalStaffRole r) { return repo.save(r); }
    @PutMapping("/{id}") @Transactional
                         public MedicalStaffRole update(@PathVariable int id, @RequestBody MedicalStaffRole r) {
                             r.setRoleId(id); return repo.save(r); }
    @DeleteMapping("/{id}") @Transactional
                         public void delete(@PathVariable int id)                     { repo.deleteById(id); }
}

// ── Staff ─────────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/admin/staff")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class StaffAdminController {

    private final StaffAdminRepository repo;

    @GetMapping          public List<MedicalStaff> all()                       { return repo.findAll(); }
    @GetMapping("/{id}") public MedicalStaff one(@PathVariable int id)         { return repo.findById(id).orElseThrow(); }
    @PostMapping         @Transactional
                         public MedicalStaff create(@RequestBody MedicalStaff s) { return repo.save(s); }
    @PutMapping("/{id}") @Transactional
                         public MedicalStaff update(@PathVariable int id, @RequestBody MedicalStaff s) {
                             s.setMedicalStaffId(id); return repo.save(s); }
    @DeleteMapping("/{id}") @Transactional
                         public void delete(@PathVariable int id)               { repo.deleteById(id); }
}

// ── Schedules ─────────────────────────────────────────────────────────────────

@RestController
@RequestMapping("/api/admin/schedules")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class ScheduleController {

    private final ScheduleRepository repo;

    @GetMapping          public List<StaffSchedule> all()                         { return repo.findAll(); }
    @GetMapping("/{id}") public StaffSchedule one(@PathVariable int id)           { return repo.findById(id).orElseThrow(); }
    @PostMapping         @Transactional
                         public StaffSchedule create(@RequestBody StaffSchedule s) { return repo.save(s); }
    @PutMapping("/{id}") @Transactional
                         public StaffSchedule update(@PathVariable int id, @RequestBody StaffSchedule s) {
                             s.setScheduleId(id); return repo.save(s); }
    @DeleteMapping("/{id}") @Transactional
                         public void delete(@PathVariable int id)                  { repo.deleteById(id); }
}
