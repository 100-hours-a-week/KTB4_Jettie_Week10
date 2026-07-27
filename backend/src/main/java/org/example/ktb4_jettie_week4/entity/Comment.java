package org.example.ktb4_jettie_week4.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.cglib.core.Local;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@NoArgsConstructor
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long commentId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String commentContent;

    @Column(nullable = false)
    private LocalDateTime commentCreatedAt;

    private LocalDateTime commentUpdatedAt;

    private LocalDateTime commentDeletedAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    @ManyToOne
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    public Comment(String commentContent, User user, Post post) {
        this.commentContent = commentContent;
        this.user = user;
        this.post = post;
        this.commentCreatedAt = LocalDateTime.now();
    }

    public void updateComment(String commentContent) {

        this.commentContent = commentContent;
        this.commentUpdatedAt = LocalDateTime.now();
    }
}
