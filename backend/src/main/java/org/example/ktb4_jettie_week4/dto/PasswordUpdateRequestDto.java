package org.example.ktb4_jettie_week4.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class PasswordUpdateRequestDto {
    private String currentPassword;
    private String password;
    private String passwordCheck;
}
