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
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserPasswordUpdateControllerTest {

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
    @DisplayName("비밀번호 수정 성공 시 200 응답과 암호화된 비밀번호가 저장된다")
    void 비밀번호수정_성공() throws Exception {
        String email = "test1@test.com";
        String oldPassword = "Test1234!!";
        String nickname = "tester1";
        String newPassword = "New1234!!";

        User user = new User(
                email,
                passwordEncoder.encode(oldPassword),
                nickname,
                null
        );
        userRepository.save(user);

        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "Test1234!!",
                                  "password": "New1234!!",
                                  "passwordCheck": "New1234!!"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nickname").value(nickname));

        User savedUser = userRepository.findById(user.getUserId())
                .orElseThrow();

        assertNotEquals(oldPassword, savedUser.getPassword());
        assertTrue(passwordEncoder.matches(newPassword, savedUser.getPassword()));
    }

    @Test
    @DisplayName("비밀번호 누락 시 400을 반환")
    void 비밀번호수정_비밀번호_누락_실패() throws Exception {
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

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "Test1234!!",
                                  "password": "",
                                  "passwordCheck": "New1234!!"
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("새 비밀번호를 입력해주세요."));
    }

    @Test
    @DisplayName("비밀번호 확인 누락 시 400을 반환")
    void 비밀번호수정_비밀번호확인_누락_실패() throws Exception {
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

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "Test1234!!",
                                  "password": "New1234!!",
                                  "passwordCheck": ""
                                }
                                """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("비밀번호 확인을 입력해주세요."));
    }

    @Test
    @DisplayName("로그인하지 않은 사용자가 비밀번호 수정 시 401 반환")
    void 비밀번호수정_인증없음_실패() throws Exception {
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

        mockMvc.perform(patch("/users/me/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "currentPassword": "Test1234!!",
                                  "password": "New1234!!",
                                  "passwordCheck": "New1234!!"
                                }
                                """))
                .andExpect(status().isUnauthorized());
    }
    @Test
    @DisplayName("새 비밀번호가 작성 조건에 맞지 않으면 400 반환")
    void 비밀번호수정_비밀번호_형식_오류_실패() throws Exception {
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

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "currentPassword": "Test1234!!",
                              "password": "password1234",
                              "passwordCheck": "password1234"
                            }
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("비밀번호 입력 조건을 확인해주세요."));
    }
    @Test
    @DisplayName("새 비밀번호 확인이 일치하지 않으면 400 반환")
    void 비밀번호수정_비밀번호확인_불일치_실패() throws Exception {
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

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "currentPassword": "Test1234!!",
                              "password": "New1234!!",
                              "passwordCheck": "New1234@@"
                            }
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("비밀번호 확인이 일치하지 않습니다."));
    }
    @Test
    @DisplayName("비밀번호 변경 대상은 경로 값이 아니라 JWT 사용자로 결정된다")
    void 비밀번호수정_JWT사용자만_변경() throws Exception {
        String email1 = "test1@test.com";
        String password1 = "Test1234!!";
        String nickname1 = "tester1";

        String email2 = "test2@test.com";
        String password2 = "Test1234@@";
        String nickname2 = "tester2";

        User user1 = new User(
                email1,
                passwordEncoder.encode(password1),
                nickname1,
                null
        );

        User user2 = new User(
                email2,
                passwordEncoder.encode(password2),
                nickname2,
                null
        );

        userRepository.save(user1);
        userRepository.save(user2);

        String accessToken = jwtProvider.createAccessToken(email2);

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "currentPassword": "Test1234@@",
                              "password": "New1234!!",
                              "passwordCheck": "New1234!!"
                            }
                            """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email2));

        User unchangedUser = userRepository.findById(user1.getUserId()).orElseThrow();
        User changedUser = userRepository.findById(user2.getUserId()).orElseThrow();

        assertTrue(passwordEncoder.matches(password1, unchangedUser.getPassword()));
        assertTrue(passwordEncoder.matches("New1234!!", changedUser.getPassword()));
    }

    @Test
    @DisplayName("현재 비밀번호가 일치하지 않으면 400 반환")
    void 비밀번호수정_현재비밀번호_불일치_실패() throws Exception {
        String email = "current@test.com";
        User user = userRepository.save(new User(
                email,
                passwordEncoder.encode("Test1234!!"),
                "current",
                null
        ));
        String accessToken = jwtProvider.createAccessToken(email);

        mockMvc.perform(patch("/users/me/password")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "currentPassword": "Wrong1234!!",
                              "password": "New1234!!",
                              "passwordCheck": "New1234!!"
                            }
                            """))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("현재 비밀번호가 일치하지 않습니다."));
    }
}
