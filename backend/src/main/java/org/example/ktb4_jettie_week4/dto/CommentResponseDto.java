package org.example.ktb4_jettie_week4.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import org.example.ktb4_jettie_week4.entity.Comment;

import java.time.LocalDateTime;

@Getter
public class CommentResponseDto {

    private Long commentId;
    private Long writerId;
    private String writer;
    private String writerProfileImage;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime commentCreatedAt;

    private String commentContent;

    public CommentResponseDto(Comment comment) {
        this.commentId = comment.getCommentId();
        this.writerId = comment.getUser().getUserId();
        this.writer = comment.getUser().getNickname();
        this.commentCreatedAt = comment.getCommentCreatedAt();
        this.commentContent = comment.getCommentContent();
        this.writerProfileImage = comment.getUser().getProfileImage();
    }
}