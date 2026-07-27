package org.example.ktb4_jettie_week4.repository;

import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.User;
import org.example.ktb4_jettie_week4.entity.Area;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUser(User user);

    Page<Post> findByUserUserId(Long userId, Pageable pageable);

    Page<Post> findByArea(Area area, Pageable pageable);
}