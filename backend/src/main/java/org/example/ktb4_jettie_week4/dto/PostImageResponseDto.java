package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import org.example.ktb4_jettie_week4.entity.PostImage;

@Getter
public class PostImageResponseDto {
    private final Long imageId;
    private final String imageUrl;
    private final int imageOrder;

    public PostImageResponseDto(PostImage image) {
        this.imageId = image.getImageId();
        this.imageUrl = image.getImageUrl();
        this.imageOrder = image.getImageOrder();
    }
}
