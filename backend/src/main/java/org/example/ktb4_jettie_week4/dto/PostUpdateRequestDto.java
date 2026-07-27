package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;

@Getter
public class PostUpdateRequestDto {
    private Long postId;
    private String title;
    private String content;
    private String postImage;
}
