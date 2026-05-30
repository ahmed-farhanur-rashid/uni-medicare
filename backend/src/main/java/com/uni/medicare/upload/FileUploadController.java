package com.uni.medicare.upload;

import com.uni.medicare.auth.AppUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Map;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class FileUploadController {

    private final FileUploadService uploadService;

    /** STUDENT — upload own profile picture */
    @PostMapping("/profile-picture")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<Map<String, Object>> uploadProfilePicture(
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AppUserDetails user) throws IOException {
        FileUpload upload = uploadService.uploadProfilePicture(file, user.getId());
        return ResponseEntity.ok(Map.of(
                "uploadId", upload.getUploadId(),
                "originalName", upload.getOriginalName(),
                "message", "Profile picture uploaded successfully"
        ));
    }

    /** LAB_TECHNICIAN — upload lab result PDF */
    @PostMapping("/lab-result/{resultId}")
    @PreAuthorize("hasRole('LAB_TECHNICIAN')")
    public ResponseEntity<Map<String, Object>> uploadLabResult(
            @PathVariable int resultId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal AppUserDetails user) throws IOException {
        FileUpload upload = uploadService.uploadLabResult(file, user.getId());
        return ResponseEntity.ok(Map.of(
                "uploadId", upload.getUploadId(),
                "originalName", upload.getOriginalName(),
                "message", "Lab result uploaded successfully"
        ));
    }

    /** Authenticated users — download file (access-controlled) */
    @GetMapping("/{uploadId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Resource> download(@PathVariable int uploadId) throws IOException {
        FileUpload upload = uploadService.getById(uploadId);
        Path filePath = uploadService.getStoragePath(upload);

        if (!Files.exists(filePath)) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(filePath.toFile());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(upload.getMimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + upload.getOriginalName() + "\"")
                .body(resource);
    }
}
