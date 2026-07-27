package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import org.example.ktb4_jettie_week4.entity.User;

@Getter
@NoArgsConstructor
public class LoginResponseDto {

    private Long userId;
    private String accessToken;

    public LoginResponseDto(User user) {
        this.userId = user.getUserId();
        this.accessToken = "token";
    }
}