package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.ktb4_jettie_week4.entity.User;

@Getter
@NoArgsConstructor
public class UserResponseDto {

    private Long userId;
    private String email;
    private String nickname;
    private String profileImage;

    public UserResponseDto(User user) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.profileImage = user.getProfileImage();
    }
}