package org.example.ktb4_jettie_week4.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(nullable = false, length = 255)
    private String password;

    @Column(nullable = false, length = 10)
    private String nickname;

    @Column(length = 255)
    private String profileImage;

    @Column(nullable = false)
    private LocalDateTime userCreatedAt;

    private LocalDateTime userUpdatedAt;

    private LocalDateTime userDeletedAt;

    public User(String email, String password, String nickname, String profileImage) {
        this.email = email;
        this.password = password;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.userCreatedAt = LocalDateTime.now();
    }

    public void updateNickname(String nickname) {
        this.nickname = nickname;
        this.userUpdatedAt = LocalDateTime.now();
    }

    public void updateProfile(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.userUpdatedAt = LocalDateTime.now();
    }

    public void updatePassword(String password) {
        this.password = password;
        this.userUpdatedAt = LocalDateTime.now();
    }
}