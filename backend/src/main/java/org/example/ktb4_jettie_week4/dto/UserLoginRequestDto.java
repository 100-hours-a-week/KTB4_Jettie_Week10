package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class UserLoginRequestDto {

    private String email;
    private String password;

}