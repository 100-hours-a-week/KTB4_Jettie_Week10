package org.example.ktb4_jettie_week4.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "post_hashtags",
        uniqueConstraints = {
                @UniqueConstraint( // 같은 순서가 두 번 저장되는 것 방지
                        name = "uk_post_hashtag_post_order",
                        columnNames = {"post_id", "tag_order"}
                ),
                @UniqueConstraint( // 한 게시글에 같은 태그가 두 번 연결되는 것 방지
                        name = "uk_post_hashtag_post_hashtag",
                        columnNames = {"post_id", "hashtag_id"}
                )
        }
)
@Getter
@NoArgsConstructor
public class PostHashtag {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long postHashtagId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "post_id", nullable = false)
    private Post post;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "hashtag_id", nullable = false)
    private Hashtag hashtag;

    @Column(name = "tag_order", nullable = false)
    private int tagOrder;

    public PostHashtag(Post post, Hashtag hashtag, int tagOrder) {
        this.post = post;
        this.hashtag = hashtag;
        this.tagOrder = tagOrder;
    }
}
