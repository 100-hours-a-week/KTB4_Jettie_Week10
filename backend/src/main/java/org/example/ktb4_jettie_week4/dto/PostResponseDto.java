package org.example.ktb4_jettie_week4.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.Area;

import java.time.LocalDateTime;

@Getter
public class PostResponseDto {

    private Long postId;
    private String title;
    private String representativeImage;
    private int likeCount;
    private int commentCount;
    private int viewCount;
    private String writerProfileImage;
    private Area area;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime postCreatedAt;

    private String writer;

    public PostResponseDto(Post post) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.representativeImage = post.getRepresentativeImage();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.viewCount = post.getViewCount();
        this.postCreatedAt = post.getPostCreatedAt();
        this.writer = post.getUser().getNickname();
        this.writerProfileImage = post.getUser().getProfileImage();
        this.area = post.getArea();
    }
}
