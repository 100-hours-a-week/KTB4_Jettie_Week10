package org.example.ktb4_jettie_week4.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.Area;

import java.time.LocalDateTime;
import java.util.List;

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
    private List<String> hashtags;

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
        this.hashtags = post.getPostHashtags().stream()
                // 프론트에 보내고 싶은 건 이름뿐. 그래서 실제 태그 이름만 꺼내서 보냄
                .map(postHashtag -> postHashtag.getHashtag().getName())
                .toList();
    }
}
