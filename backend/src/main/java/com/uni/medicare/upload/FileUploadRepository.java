package com.uni.medicare.upload;

import org.springframework.data.jpa.repository.JpaRepository;

public interface FileUploadRepository extends JpaRepository<FileUpload, Integer> {
}
