package com.uni.medicare.notification;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {
    List<Notification> findByRecipientTypeAndRecipientId(String recipientType, Integer recipientId);
}
