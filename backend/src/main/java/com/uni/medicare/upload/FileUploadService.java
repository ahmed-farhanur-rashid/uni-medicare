package com.uni.medicare.upload;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileUploadService {

    private final FileUploadRepository repo;

    @Value("${app.upload.base-path:/uploads}")
    private String basePath;

    @Value("${app.upload.max-file-size-mb:10}")
    private int maxFileSizeMb;

    private static final Set<String> PROFILE_PICTURE_TYPES = Set.of("image/jpeg", "image/png");
    private static final Set<String> LAB_RESULT_TYPES = Set.of("application/pdf");

    @Transactional
    public FileUpload uploadProfilePicture(MultipartFile file, int studentId) throws IOException {
        validateSize(file);
        validateMime(file, PROFILE_PICTURE_TYPES, "Profile pictures must be JPEG or PNG");

        String storedName = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        Path storagePath = Paths.get(basePath, "profile_picture", storedName);
        Files.createDirectories(storagePath.getParent());
        file.transferTo(storagePath.toFile());

        FileUpload upload = new FileUpload();
        upload.setUploaderType("student");
        upload.setUploaderId(studentId);
        upload.setFileType("profile_picture");
        upload.setOriginalName(file.getOriginalFilename());
        upload.setStoredName(storedName);
        upload.setMimeType(file.getContentType());
        upload.setFileSizeBytes(file.getSize());
        upload.setStoragePath(storagePath.toString());
        return repo.save(upload);
    }

    @Transactional
    public FileUpload uploadLabResult(MultipartFile file, int staffId) throws IOException {
        validateSize(file);
        validateMime(file, LAB_RESULT_TYPES, "Lab results must be PDF");

        String storedName = UUID.randomUUID() + getExtension(file.getOriginalFilename());
        Path storagePath = Paths.get(basePath, "lab_result_pdf", storedName);
        Files.createDirectories(storagePath.getParent());
        file.transferTo(storagePath.toFile());

        FileUpload upload = new FileUpload();
        upload.setUploaderType("staff");
        upload.setUploaderId(staffId);
        upload.setFileType("lab_result_pdf");
        upload.setOriginalName(file.getOriginalFilename());
        upload.setStoredName(storedName);
        upload.setMimeType(file.getContentType());
        upload.setFileSizeBytes(file.getSize());
        upload.setStoragePath(storagePath.toString());
        return repo.save(upload);
    }

    public FileUpload getById(int uploadId) {
        return repo.findById(uploadId)
                .orElseThrow(() -> new EntityNotFoundException("Upload not found"));
    }

    public Path getStoragePath(FileUpload upload) {
        return Paths.get(upload.getStoragePath());
    }

    private void validateSize(MultipartFile file) {
        long maxBytes = maxFileSizeMb * 1024L * 1024L;
        if (file.getSize() > maxBytes) {
            throw new IllegalStateException("File size exceeds maximum of " + maxFileSizeMb + "MB");
        }
    }

    private void validateMime(MultipartFile file, Set<String> allowedTypes, String message) {
        if (!allowedTypes.contains(file.getContentType())) {
            throw new IllegalStateException(message);
        }
    }

    private String getExtension(String originalName) {
        if (originalName == null) return "";
        int dot = originalName.lastIndexOf('.');
        return dot >= 0 ? originalName.substring(dot) : "";
    }
}
