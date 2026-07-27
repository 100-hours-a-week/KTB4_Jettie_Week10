package org.example.ktb4_jettie_week4.repository;

import org.example.ktb4_jettie_week4.entity.Comment;
import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {

    void deleteByUser(User user);

    void deleteByPost(Post post);

    List<Comment> findByPostOrderByCommentCreatedAtDesc(Post post);

    long countByPost(Post post);
}