package com.uni.medicare.admin;

import com.uni.medicare.billing.Service;
import com.uni.medicare.billing.ServiceRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/services")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class ServiceAdminController {

    private final ServiceRepository serviceRepo;

    @GetMapping
    public Page<Service> all(Pageable pageable) {
        return serviceRepo.findAll(pageable);
    }

    @GetMapping("/{id}")
    public Service one(@PathVariable int id) {
        return serviceRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
    }

    @PostMapping
    @Transactional
    public Service create(@RequestBody Service service) {
        return serviceRepo.save(service);
    }

    @PutMapping("/{id}")
    @Transactional
    public Service update(@PathVariable int id, @RequestBody Service service) {
        service.setServiceId(id);
        return serviceRepo.save(service);
    }

    @PatchMapping("/{id}/toggle")
    @Transactional
    public Service toggleActive(@PathVariable int id) {
        Service service = serviceRepo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Service not found"));
        service.setIsActive(!service.getIsActive());
        return serviceRepo.save(service);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void delete(@PathVariable int id) {
        serviceRepo.deleteById(id);
    }
}
