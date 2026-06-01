package com.uni.medicare.admin;

import com.uni.medicare.shared.dto.MedicalStaffResponse;
import com.uni.medicare.shared.entity.Department;
import com.uni.medicare.shared.entity.MedicalStaff;
import com.uni.medicare.shared.entity.MedicalStaffRole;
import com.uni.medicare.shared.entity.StaffSchedule;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

// ── Specialty → Department mapping ────────────────────────────────────────────

@org.springframework.stereotype.Component
@RequiredArgsConstructor
class SpecialtyDepartmentResolver {

    private final DepartmentRepository deptRepo;

    /**
     * Auto-assign department based on specialty.
     * Returns null for non-doctor roles (they pick department manually).
     */
    Department resolve(String specialty, String roleName) {
        if (specialty == null || specialty.isBlank() || !"DOCTOR".equals(roleName)) {
            return null;
        }
        String deptName = switch (specialty) {
            case "General Medicine"  -> "General Medicine";
            case "Counseling"        -> "Counseling";
            case "Pathology"         -> "Laboratory";
            case "Emergency Medicine"-> "Emergency";
            case "Physiotherapy"     -> "Physiotherapy";
            case "Gynecology"        -> "Reproductive & Sexual Health";
            case "Urology"           -> "Reproductive & Sexual Health";
            default -> null;
        };
        if (deptName == null) return null;
        return deptRepo.findByName(deptName)
                .orElseThrow(() -> new EntityNotFoundException("Department not found: " + deptName));
    }
}

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
    private final PasswordEncoder     passwordEncoder;
    private final SpecialtyDepartmentResolver deptResolver;

    @GetMapping          public List<MedicalStaffResponse> all()                       { return repo.findAll().stream().map(MedicalStaffResponse::fromEntity).toList(); }
    @GetMapping("/{id}") public MedicalStaffResponse one(@PathVariable int id)         { return MedicalStaffResponse.fromEntity(repo.findById(id).orElseThrow()); }

    @PostMapping         @Transactional
                         public MedicalStaffResponse create(@RequestBody MedicalStaff s) {
                             // Auto-assign department for doctors based on specialty
                             String roleName = s.getRole() != null ? s.getRole().getRoleName() : null;
                             if ("DOCTOR".equals(roleName) && s.getDepartment() == null) {
                                 Department dept = deptResolver.resolve(s.getSpecialty(), roleName);
                                 s.setDepartment(dept);
                             }
                             s.setPassword(passwordEncoder.encode(s.getPassword()));
                             return MedicalStaffResponse.fromEntity(repo.save(s));
                         }

    @PutMapping("/{id}") @Transactional
                         public MedicalStaffResponse update(@PathVariable int id, @RequestBody MedicalStaff s) {
                             MedicalStaff existing = repo.findById(id).orElseThrow();
                             s.setMedicalStaffId(id);

                             // Only admins can change specialty — auto-reassign department
                             String roleName = existing.getRole() != null ? existing.getRole().getRoleName() : null;
                             if (s.getSpecialty() != null && !"DOCTOR".equals(roleName)) {
                                 s.setSpecialty(existing.getSpecialty()); // non-doctors keep their specialty
                             }
                             if ("DOCTOR".equals(roleName) && s.getSpecialty() != null) {
                                 Department dept = deptResolver.resolve(s.getSpecialty(), roleName);
                                 s.setDepartment(dept);
                             } else {
                                 s.setDepartment(existing.getDepartment());
                             }

                             if (s.getPassword() != null && !s.getPassword().isEmpty()) {
                                 s.setPassword(passwordEncoder.encode(s.getPassword()));
                             } else {
                                 s.setPassword(existing.getPassword());
                             }
                             if (s.getRole() == null) s.setRole(existing.getRole());
                             if (s.getName() == null) s.setName(existing.getName());
                             if (s.getEmail() == null) s.setEmail(existing.getEmail());
                             return MedicalStaffResponse.fromEntity(repo.save(s));
                         }

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

// ── Admin Password Verification ──────────────────────────────────────────────

@RestController
@RequestMapping("/api/admin/verify")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
class AdminVerifyController {

    private final StaffAdminRepository staffRepo;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/password")
    public Map<String, Boolean> verifyPassword(@RequestBody Map<String, String> body,
                                               @org.springframework.security.core.annotation.AuthenticationPrincipal
                                               com.uni.medicare.auth.AppUserDetails user) {
        String password = body.get("password");
        if (password == null || password.isBlank()) {
            return Map.of("valid", false);
        }
        MedicalStaff admin = staffRepo.findByMedicalStaffId(user.getId())
                .orElseThrow(() -> new EntityNotFoundException("Admin not found"));
        boolean valid = passwordEncoder.matches(password, admin.getPassword());
        return Map.of("valid", valid);
    }
}
