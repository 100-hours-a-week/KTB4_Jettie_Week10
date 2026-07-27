package org.example.ktb4_jettie_week4.repository;

import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.PostLike;
import org.example.ktb4_jettie_week4.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PostLikeRepository extends JpaRepository<PostLike, Long> {

    void deleteByUser(User user);

    void deleteByPost(Post post);

    Optional<PostLike> findByPostAndUser(Post post, User user);

    boolean existsByPostAndUser(Post post, User user);

    List<PostLike> findByUser(User user);

    long countByPost(Post post);
}