package org.example.ktb4_jettie_week4;

import org.example.ktb4_jettie_week4.entity.User;
import org.example.ktb4_jettie_week4.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserLoginControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @BeforeEach
    void setUp() {
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("로그인 성공 시 200 응답 반환")
    void 로그인_성공() throws Exception {
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

        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "email": "%s",
                          "password": "%s"
                        }
                        """.formatted(email, password)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.accessToken").exists());
    }
    @Test
    @DisplayName("이메일 누락 시 400을 반환한다.")
    void 이메일_누락_실패() throws Exception {

        String email = "";
        String password = "Test1234!!";
        String nickname = "tester1";
        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                null
        );
        userRepository.save(user);
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "email": "",
                          "password": "%s"
                        }
                        """.formatted(password)))
                .andExpect(status().isBadRequest());
    }
    @Test
    @DisplayName("비밀번호 누락 시 400을 반환한다.")
    void 비밀번호_누락_실패() throws Exception {

        String email = "test1@test.com";
        String password = "";
        String nickname = "tester1";

        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                null
        );
        userRepository.save(user);
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "email": "%s",
                          "password": ""
                        }
                        """.formatted(password)))
                .andExpect(status().isBadRequest());}
    @Test
    @DisplayName("이메일 또는 비밀번호가 일치하지 않으면 401 응답 반환")
    void 로그인_이메일_비밀번호_불일치_실패() throws Exception {
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
        mockMvc.perform(post("/users/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                            {
                              "email": "%s",
                              "password": "Passwordmiss1!"
                            }
                            """.formatted(email)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("이메일 또는 비밀번호가 일치하지 않습니다."));
    }
}