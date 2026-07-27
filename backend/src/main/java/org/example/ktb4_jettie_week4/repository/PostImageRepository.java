package org.example.ktb4_jettie_week4.repository;

import org.example.ktb4_jettie_week4.entity.PostImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostImageRepository extends JpaRepository<PostImage, Long> {
    List<PostImage> findByPostPostIdOrderByImageOrderAscImageIdAsc(Long postId);
}
