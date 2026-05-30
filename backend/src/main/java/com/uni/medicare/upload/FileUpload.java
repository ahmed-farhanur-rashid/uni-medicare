package com.uni.medicare.upload;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Table(name = "file_uploads")
@Getter @Setter
public class FileUpload {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer uploadId;

    @Column(nullable = false, length = 10)
    private String uploaderType; // 'student' or 'staff'

    @Column(nullable = false)
    private Integer uploaderId;

    @Column(nullable = false, length = 20)
    private String fileType; // 'profile_picture', 'lab_result_pdf', 'other'

    @Column(nullable = false, length = 255)
    private String originalName;

    @Column(nullable = false, unique = true, length = 255)
    private String storedName;

    @Column(nullable = false, length = 100)
    private String mimeType;

    @Column(nullable = false)
    private Long fileSizeBytes;

    @Column(nullable = false, length = 500)
    private String storagePath;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
