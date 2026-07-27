package org.example.ktb4_jettie_week4.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Entity
@Table(name = "posts")
@Getter
@NoArgsConstructor
public class Post {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postId;

    @Column(nullable = false, length = 26)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Area area;

    @OneToMany(mappedBy = "post", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("imageOrder ASC, imageId ASC")
    private List<PostImage> postImages = new ArrayList<>();

    @Column(nullable = false)
    private int likeCount = 0;

    @Column(nullable = false)
    private int commentCount = 0;

    @Column(nullable = false)
    private int viewCount = 0;

    @Column(nullable = false)
    private LocalDateTime postCreatedAt;

    private LocalDateTime postUpdatedAt;

    private LocalDateTime postDeletedAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Post(String title, String content, User user, Area area) {
        this.title = title;
        this.content = content;
        this.postCreatedAt = LocalDateTime.now();
        this.user = user;
        this.area = area;
    }

    public void updatePost(String title, String content, Area area) {
        this.title = title;
        this.content = content;
        this.postUpdatedAt = LocalDateTime.now();
        this.area = area;
    }

    public void addImage(PostImage image) {
        image.setPost(this);
        postImages.add(image);
        postImages.sort(Comparator.comparingInt(PostImage::getImageOrder));
    }

    public void replaceImages(List<PostImage> images) {
        postImages.clear();
        for (int index = 0; index < images.size(); index++) {
            PostImage image = images.get(index);
            image.changeOrder(index);
            image.setPost(this);
            postImages.add(image);
        }
    }

    public String getRepresentativeImage() {
        return postImages.stream()
                .min(Comparator.comparingInt(PostImage::getImageOrder))
                .map(PostImage::getImageUrl)
                .orElse(null);
    }

    public void increaseCommentCount() {
        this.commentCount++;
    }

    public void decreaseCommentCount() {
        if (this.commentCount > 0) {
            this.commentCount--;
        }
    }

    public void increaseLikeCount() {
        this.likeCount++;
    }

    public void decreaseLikeCount() {
        if (this.likeCount > 0) {
            this.likeCount--;
        }
    }

    public void increaseViewCount() {
        this.viewCount++;
    }
    public void setLikeCount(int likeCount) {
        this.likeCount = likeCount;
    }

    public void setCommentCount(int commentCount) {
        this.commentCount = commentCount;
    }
}
