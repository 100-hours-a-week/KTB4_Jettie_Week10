package org.example.ktb4_jettie_week4.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "post_images", indexes = {
        @Index(name = "idx_post_image_post_order", columnList = "post_id,image_order")
})
@Getter
@NoArgsConstructor
public class PostImage {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @Column(nullable = false, length = 500)
    private String imageUrl;

    @Column(name = "image_order", nullable = false)
    private int imageOrder;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public PostImage(String imageUrl, int imageOrder) {
        this.imageUrl = imageUrl;
        this.imageOrder = imageOrder;
        this.createdAt = LocalDateTime.now();
    }

    void setPost(Post post) {
        this.post = post;
    }

    public void changeOrder(int imageOrder) {
        this.imageOrder = imageOrder;
    }
}
