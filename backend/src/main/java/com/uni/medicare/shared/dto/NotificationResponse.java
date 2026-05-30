package com.uni.medicare.shared.dto;

import com.uni.medicare.notification.Notification;
import java.time.LocalDateTime;

public record NotificationResponse(
        Integer notificationId,
        String recipientType,
        Integer recipientId,
        String title,
        String message,
        Boolean isRead,
        String channel,
        LocalDateTime readAt,
        LocalDateTime createdAt
) {
    public static NotificationResponse fromEntity(Notification n) {
        return new NotificationResponse(
                n.getNotificationId(), n.getRecipientType(), n.getRecipientId(),
                n.getTitle(), n.getMessage(), n.getIsRead(), n.getChannel(),
                n.getReadAt(), n.getCreatedAt()
        );
    }
}
