package org.example.ktb4_jettie_week4;

import org.example.ktb4_jettie_week4.dto.PostDetailResponseDto;
import org.example.ktb4_jettie_week4.entity.Area;
import org.example.ktb4_jettie_week4.entity.Post;
import org.example.ktb4_jettie_week4.entity.PostImage;
import org.example.ktb4_jettie_week4.entity.User;
import org.example.ktb4_jettie_week4.repository.PostImageRepository;
import org.example.ktb4_jettie_week4.repository.PostRepository;
import org.example.ktb4_jettie_week4.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class PostImagePersistenceTest {
    @Autowired UserRepository userRepository;
    @Autowired PostRepository postRepository;
    @Autowired PostImageRepository postImageRepository;

    @Test
    void savesImagesInOrderAndUsesFirstImageAsRepresentative() {
        User user = userRepository.save(new User(
                "images@example.com", "encoded-password", "imageUser", null
        ));
        Post post = new Post("다중 이미지", "본문", user, Area.JEJU);
        post.addImage(new PostImage("/uploads/post/second.jpg", 1));
        post.addImage(new PostImage("/uploads/post/first.jpg", 0));
        post.addImage(new PostImage("/uploads/post/third.jpg", 2));
        post = postRepository.saveAndFlush(post);

        List<PostImage> images =
                postImageRepository.findByPostPostIdOrderByImageOrderAscImageIdAsc(post.getPostId());
        PostDetailResponseDto detail = new PostDetailResponseDto(post, false);

        assertThat(images).extracting(PostImage::getImageOrder).containsExactly(0, 1, 2);
        assertThat(detail.getRepresentativeImage()).isEqualTo("/uploads/post/first.jpg");
        assertThat(detail.getPostImages()).hasSize(3);
    }
}
