package org.example.ktb4_jettie_week4.repository;

import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.User;
import org.example.ktb4_jettie_week4.entity.Area;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PostRepository extends JpaRepository<Post, Long> {

    List<Post> findByUser(User user);

    Page<Post> findByUserUserId(Long userId, Pageable pageable);

    Page<Post> findByArea(Area area, Pageable pageable);

    @Query("""
    SELECT p
    FROM Post p
    JOIN p.postHashtags ph
    JOIN ph.hashtag h
    WHERE h.name = :hashtag
    """)
    Page<Post> findByHashtagName(
            @Param("hashtag") String hashtag,
            Pageable pageable
    );

    @Query("""
    SELECT p
    FROM Post p
    JOIN p.postHashtags ph
    JOIN ph.hashtag h
    WHERE p.area = :area
      AND h.name = :hashtag
    """)
    Page<Post> findByAreaAndHashtagName(
            @Param("area") Area area,
            @Param("hashtag") String hashtag,
            Pageable pageable
    );
}