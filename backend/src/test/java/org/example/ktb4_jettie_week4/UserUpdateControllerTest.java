package org.example.ktb4_jettie_week4;

import org.example.ktb4_jettie_week4.entity.User;
import org.example.ktb4_jettie_week4.repository.UserRepository;
import org.example.ktb4_jettie_week4.security.JwtProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
@SpringBootTest
@AutoConfigureMockMvc
class UserUpdateControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtProvider jwtProvider;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("회원정보 수정 성공 시 200 응답과 수정된 회원 정보 반환")
    void 회원정보수정_성공() throws Exception {
        String email = "test1@test.com";
        String password = "Test1234!!";
        String oldNickname = "tester1";
        String newNickname = "tester2";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                oldNickname,
                null
        );
        user = userRepository.save(user);

        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(multipart("/users/{userId}", user.getUserId())
                        .param("nickname", newNickname)
                        .header("Authorization", "Bearer " + accessToken)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nickname").value(newNickname));

        User updatedUser = userRepository.findById(user.getUserId())
                .orElseThrow();

        assertEquals(newNickname, updatedUser.getNickname());
    }
    @Test
    @DisplayName("닉네임 누락 시 400을 반환한다.")
    void 회원정보수정_닉네임_누락_실패() throws Exception {

        String email = "test1@test.com";
        String password = "Test1234!!";
        String oldNickname = "tester1";
        String newNickname = "";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                oldNickname,
                null
        );
        userRepository.save(user);
        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(multipart("/users/{userId}", user.getUserId())
                        .param("nickname", newNickname)
                        .header("Authorization", "Bearer " + accessToken)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("닉네임을 입력해주세요."));
    }
    @Test
    @DisplayName("이미 존재하는 닉네임으로 회원정보수정 시 409 응답을 반환")
    void 회원정보수정_닉네임중복_실패() throws Exception {
        String email1 = "test1@test.com";
        String password1 = "Test1234!!";
        String oldNickname = "tester1";

        String email2 = "test2@test.com";
        String password2 = "Test1234@@";
        String duplicateNickname = "tester2";

        User user1 = new User(
                email1,
                passwordEncoder.encode(password1),
                oldNickname,
                null
        );

        User user2 = new User(
                email2,
                passwordEncoder.encode(password2),
                duplicateNickname,
                null
        );

        userRepository.save(user1);
        userRepository.save(user2);

        String accessToken = jwtProvider.createAccessToken(email1);

        mockMvc.perform(multipart("/users/{userId}", user1.getUserId())
                        .param("nickname", duplicateNickname)
                        .header("Authorization", "Bearer " + accessToken)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("중복된 닉네임입니다."));
    }
    @Test
    @DisplayName("닉네임 10자 초과해 회원정보 수정 시 400을 반환")
    void 회원정보수정_닉네임_길이_초과_실패() throws Exception {

        String email = "test1@test.com";
        String password = "Test1234!!";
        String oldNickname = "tester1";
        String newNickname = "testertester";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                oldNickname,
                null
        );
        userRepository.save(user);
        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(multipart("/users/{userId}", user.getUserId())
                        .param("nickname", newNickname)
                        .header("Authorization", "Bearer " + accessToken)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("닉네임은 10자 이하로 입력해주세요."));
    }
    @Test
    @DisplayName("로그인하지 않은 사용자가 회원정보수정 시 401 반환")
    void 회원정보수정_인증없음_실패() throws Exception {
        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "tester1";
        String newNickname = "tester2";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                null
        );
        userRepository.save(user);

        mockMvc.perform(multipart("/users/{userId}", user.getUserId())
                        .param("nickname", newNickname)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));
    }
    @Test
    @DisplayName("다른 사용자의 회원정보수정 시 403 응답 반환")
    void 회원정보수정_다른사용자_실패() throws Exception {
        User user = new User(
                "owner@test.com",
                passwordEncoder.encode("Test1234!!"),
                "owner1",
                null
        );
        user = userRepository.save(user);

        User otherUser = new User(
                "other@test.com",
                passwordEncoder.encode("Test1234!!"),
                "other1",
                null
        );
        otherUser = userRepository.save(otherUser);

        String otherUserToken = jwtProvider.createAccessToken(otherUser.getEmail());

        // when & then
        mockMvc.perform(multipart("/users/{userId}", user.getUserId())
                        .param("nickname", "changed")
                        .header("Authorization", "Bearer " + otherUserToken)
                        .with(request -> {
                            request.setMethod("PATCH");
                            return request;
                        }))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("회원정보 수정 권한이 없습니다."));
    }
    @Test
    @DisplayName("회원 삭제 성공 시 200 응답 반환하고 회원 삭제")
    void 회원삭제_성공() throws Exception {
        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "tester1";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                null
        );
        userRepository.save(user);

        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(delete("/users/{userId}", user.getUserId())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isOk())
                .andExpect(content().string("회원 삭제 성공"));

        assertFalse(userRepository.existsById(user.getUserId()));
    }
    @Test
    @DisplayName("로그인하지 않은 사용자가 회원삭제 시도 시 401 반환")
    void 회원삭제_인증없음_실패() throws Exception {
        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "tester1";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                null
        );
        userRepository.save(user);

        mockMvc.perform(delete("/users/{userId}", user.getUserId()))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("로그인이 필요합니다."));

        assertTrue(userRepository.existsById(user.getUserId()));
    }
    @Test
    @DisplayName("다른 사용자의 회원 삭제 시 403 응답 반환")
    void 회원삭제_다른사용자_실패() throws Exception {
        User user = new User(
                "owner@test.com",
                passwordEncoder.encode("Test1234!!"),
                "owner1",
                null
        );
        user = userRepository.save(user);

        User otherUser = new User(
                "other@test.com",
                passwordEncoder.encode("Test1234!!"),
                "other1",
                null
        );
        otherUser = userRepository.save(otherUser);

        String otherUserToken = jwtProvider.createAccessToken(otherUser.getEmail());

        // when & then
        mockMvc.perform(delete("/users/{userId}", user.getUserId())
                        .header("Authorization", "Bearer " + otherUserToken))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403))
                .andExpect(jsonPath("$.message").value("회원 탈퇴 권한이 없습니다."));

        assertTrue(userRepository.existsById(user.getUserId()));
    }
}