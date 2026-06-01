package com.uni.medicare.department;

import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/department-schedules")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class DepartmentScheduleController {

    private final DepartmentScheduleService service;

    @GetMapping
    public List<Map<String, Object>> all() {
        return service.getAll();
    }

    @GetMapping("/{departmentId}")
    public Map<String, Object> getByDepartment(@PathVariable int departmentId) {
        return service.getByDepartmentId(departmentId);
    }

    @PutMapping("/{departmentId}")
    @Transactional
    public Map<String, Object> upsert(@PathVariable int departmentId, @RequestBody Map<String, Object> body) {
        return service.upsert(departmentId, body);
    }

    @DeleteMapping("/{departmentId}")
    @Transactional
    public void delete(@PathVariable int departmentId) {
        service.delete(departmentId);
    }
}
