package org.example.ktb4_jettie_week4.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Getter;
import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.Area;
import java.time.LocalDateTime;
import java.util.List;

@Getter
public class PostDetailResponseDto {

    private Long postId;
    private String title;
    private String representativeImage;
    private List<PostImageResponseDto> postImages;
    private String content;
    private int likeCount;
    private int commentCount;
    private int viewCount;
    private String writerProfileImage;
    private Area area;
    private List<String> hashtags;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm")
    private LocalDateTime postCreatedAt;

    private String writer;
    private Long writerId;
    private boolean likedByMe;

    public PostDetailResponseDto(Post post, boolean likedByMe) {
        this.postId = post.getPostId();
        this.title = post.getTitle();
        this.representativeImage = post.getRepresentativeImage();
        this.postImages = post.getPostImages().stream()
                .map(PostImageResponseDto::new)
                .toList();
        this.content = post.getContent();
        this.likeCount = post.getLikeCount();
        this.commentCount = post.getCommentCount();
        this.viewCount = post.getViewCount();
        this.postCreatedAt = post.getPostCreatedAt();
        this.writer = post.getUser().getNickname();
        this.writerId = post.getUser().getUserId();
        this.likedByMe = likedByMe;
        this.writerProfileImage = post.getUser().getProfileImage();
        this.area = post.getArea();
        this.hashtags = post.getPostHashtags().stream()
                .map(postHashtag -> postHashtag.getHashtag().getName())
                .toList();
    }
}
