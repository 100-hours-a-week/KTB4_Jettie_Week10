package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserSignupRequestDto {

    private String email;
    private String password;
    private String nickname;
    private String profileImage;

}