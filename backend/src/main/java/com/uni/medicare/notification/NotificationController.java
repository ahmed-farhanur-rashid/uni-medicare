package com.uni.medicare.notification;

import com.uni.medicare.auth.AppUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService service;

    @GetMapping("/my")
    public List<Notification> getMy(@AuthenticationPrincipal AppUserDetails user) {
        return service.getForUser(user);
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<Notification> markRead(
            @PathVariable int id,
            @AuthenticationPrincipal AppUserDetails user) {
        return ResponseEntity.ok(service.markRead(id, user));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Notification> create(
            @Valid @RequestBody CreateNotificationRequest req) {
        return ResponseEntity.ok(service.create(req));
    }
}
