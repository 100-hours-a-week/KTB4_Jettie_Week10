package org.example.ktb4_jettie_week4.service;

import org.example.ktb4_jettie_week4.exception.ValidationException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.util.UUID;

@Service
public class PostImageStorageService {
    private final Path uploadDirectory = Paths.get(
            System.getProperty("user.dir"), "uploads", "post"
    ).toAbsolutePath().normalize();

    public String save(MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new ValidationException("비어 있는 이미지는 업로드할 수 없습니다.");
        }
        String contentType = image.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new ValidationException("이미지 파일만 업로드할 수 있습니다.");
        }
        String originalFilename = image.getOriginalFilename();
        String extension = "";
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        }
        String savedFilename = UUID.randomUUID() + extension;
        try {
            Files.createDirectories(uploadDirectory);
            Path target = uploadDirectory.resolve(savedFilename).normalize();
            if (!target.startsWith(uploadDirectory)) {
                throw new ValidationException("올바르지 않은 파일 경로입니다.");
            }
            Files.copy(image.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/post/" + savedFilename;
        } catch (IOException exception) {
            throw new RuntimeException("게시글 이미지 저장에 실패했습니다.", exception);
        }
    }

    public void delete(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return;
        String filename = imageUrl.substring(imageUrl.lastIndexOf('/') + 1);
        Path target = uploadDirectory.resolve(filename).normalize();
        if (!target.startsWith(uploadDirectory)) return;
        try {
            Files.deleteIfExists(target);
        } catch (IOException exception) {
            throw new RuntimeException("게시글 이미지 삭제에 실패했습니다.", exception);
        }
    }
}
