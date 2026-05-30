package com.uni.medicare.notification;

import com.uni.medicare.auth.AppUserDetails;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repo;

    public List<Notification> getForUser(AppUserDetails user) {
        return repo.findByRecipientTypeAndRecipientId(user.getType(), user.getId());
    }

    @Transactional
    public Notification markRead(int id, AppUserDetails user) {
        Notification n = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Notification not found"));
        // Users can only mark their own notifications
        if (!n.getRecipientType().equals(user.getType()) ||
            !n.getRecipientId().equals(user.getId())) {
            throw new IllegalStateException("Access denied");
        }
        n.setIsRead(true);
        n.setReadAt(LocalDateTime.now());
        return repo.save(n);
    }

    @Transactional
    public Notification create(CreateNotificationRequest req) {
        Notification n = new Notification();
        n.setRecipientType(req.recipientType());
        n.setRecipientId(req.recipientId());
        n.setTitle(req.title());
        n.setMessage(req.message());
        n.setChannel(req.channel() != null ? req.channel() : "in_app");
        return repo.save(n);
    }
}
