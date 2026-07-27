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

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
class UserSignupControllerTest {

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
    @DisplayName("회원가입 성공 시 201 응답과 회원 정보, 암호화된 비밀번호가 저장된다")
    void 회원가입_성공() throws Exception {
        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "tester1";

        mockMvc.perform(
                        multipart("/users/signup")
                                .param("email", email)
                                .param("password", password)
                                .param("nickname", nickname)
                )
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.nickname").value(nickname));

        User savedUser = userRepository.findByEmail(email)
                .orElseThrow();

        assertEquals(email, savedUser.getEmail());
        assertEquals(nickname, savedUser.getNickname());

        assertNotEquals(password, savedUser.getPassword());

        assertTrue(passwordEncoder.matches(password, savedUser.getPassword()));
    }

    @Test
    @DisplayName("이미 존재하는 이메일로 회원가입 시 409 응답을 반환한다")
    void 회원가입_이메일중복_실패() throws Exception {

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

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", "tester3"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("중복된 이메일입니다."));
    }
    @Test
    @DisplayName("이미 존재하는 닉네임으로 회원가입 시 409 응답을 반환한다")
    void 회원가입_닉네임중복_실패() throws Exception {

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

        mockMvc.perform(multipart("/users/signup")
                        .param("email", "test2@test.com")
                        .param("password", "Test1234@@")
                        .param("nickname", nickname))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409))
                .andExpect(jsonPath("$.message").value("중복된 닉네임입니다."));
    }

    @Test
    @DisplayName("이메일 누락 시 400을 반환한다.")
    void 회원가입_이메일_누락_실패() throws Exception {

        String email = "";
        String password = "Test1234!!";
        String nickname = "tester1";

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", nickname))
                    .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("이메일을 입력해주세요."));
    }
    @Test
    @DisplayName("비밀번호 누락 시 400을 반환한다.")
    void 회원가입_비밀번호_누락_실패() throws Exception {

        String email = "test1@test.com";
        String password = "";
        String nickname = "tester1";

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", nickname))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("비밀번호를 입력해주세요."));
    }
    @Test
    @DisplayName("닉네임 누락 시 400을 반환한다.")
    void 회원가입_닉네임_누락_실패() throws Exception {

        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "";

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", nickname))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("닉네임을 입력해주세요."));
    }
    @Test
    @DisplayName("비밀번호 형식 오류 시 400을 반환한다.")
    void 회원가입_비밀번호_형식_오류_실패() throws Exception {

        String email = "test1@test.com";
        String password = "password1234";
        String nickname = "tester1";

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", nickname))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("비밀번호 입력 조건을 확인해주세요."));
    }
    @Test
    @DisplayName("닉네임 10자 초과 시 400을 반환한다.")
    void 회원가입_닉네임_길이_초과_실패() throws Exception {

        String email = "test1@test.com";
        String password = "Test1234!!";
        String nickname = "testertester";

        mockMvc.perform(multipart("/users/signup")
                        .param("email", email)
                        .param("password", password)
                        .param("nickname", nickname))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.message").value("닉네임은 10자 이하로 입력해주세요."));
    }
}