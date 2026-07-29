package org.example.ktb4_jettie_week4.controller;
import org.springframework.security.core.Authentication;
import org.example.ktb4_jettie_week4.dto.*;
import org.example.ktb4_jettie_week4.entity.*;
import org.example.ktb4_jettie_week4.exception.*;
import org.example.ktb4_jettie_week4.repository.CommentRepository;
import org.example.ktb4_jettie_week4.repository.PostLikeRepository;
import org.example.ktb4_jettie_week4.repository.PostRepository;
import org.example.ktb4_jettie_week4.repository.UserRepository;
import org.example.ktb4_jettie_week4.security.JwtProvider;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserRepository userRepository;
    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final PostLikeRepository postLikeRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtProvider jwtProvider;

    public UserController(
            UserRepository userRepository,
            PostRepository postRepository,
            CommentRepository commentRepository,
            PostLikeRepository postLikeRepository,
            PasswordEncoder passwordEncoder,
            AuthenticationManager authenticationManager,
            JwtProvider jwtProvider
    ) {
        this.userRepository = userRepository;
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.postLikeRepository = postLikeRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtProvider = jwtProvider;
    }

    @PostMapping("/signup")
    public ResponseEntity<UserResponseDto> signup(
            @RequestParam String email,
            @RequestParam String password,
            @RequestParam String nickname,
            @RequestParam(required = false) MultipartFile profileImage
    ) {
        if (email == null || email.isBlank()) {
            throw new ValidationException("이메일을 입력해주세요.");
        }

        if (password == null || password.isBlank()) {
            throw new ValidationException("비밀번호를 입력해주세요.");
        }

        if (password.length() < 8 || password.length() > 20) {
            throw new ValidationException("비밀번호는 8자 이상, 20자 이하로 입력해주세요.");
        }

        String regex =
                "^(?=.*[a-z])" +
                        "(?=.*[A-Z])" +
                        "(?=.*\\d)" +
                        "(?=.*[!@#$%^&*])" +
                        ".+$";

        if (!password.matches(regex)) {
            throw new ValidationException("비밀번호 입력 조건을 확인해주세요.");
        }

        if (nickname == null || nickname.isBlank()) {
            throw new ValidationException("닉네임을 입력해주세요.");
        }

        if (nickname.length() > 10) {
            throw new ValidationException("닉네임은 10자 이하로 입력해주세요.");
        }

        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("중복된 이메일입니다.");
        }

        if (userRepository.existsByNickname(nickname)) {
            throw new ConflictException("중복된 닉네임입니다.");
        }

        String profileImagePath = saveProfileImage(profileImage);

        User user = new User(
                email,
                passwordEncoder.encode(password),
                nickname,
                profileImagePath
        );

        user = userRepository.save(user);

        return ResponseEntity.status(HttpStatus.CREATED).body(new UserResponseDto(user));
    }

    private String saveProfileImage(MultipartFile profileImage) {
        if (profileImage == null || profileImage.isEmpty()) {
            return null;
        }

        try {
            String contentType = profileImage.getContentType();

            if (contentType == null || !contentType.startsWith("image/")) {
                throw new ValidationException("이미지 파일만 업로드할 수 있습니다.");
            }

            String originalFilename = profileImage.getOriginalFilename();
            String extension = "";

            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            String savedFilename = UUID.randomUUID() + extension;

            Path uploadDir = Paths.get(System.getProperty("user.dir"), "uploads", "profile");
            Files.createDirectories(uploadDir);

            Path savePath = uploadDir.resolve(savedFilename);

            Files.copy(
                    profileImage.getInputStream(),
                    savePath,
                    StandardCopyOption.REPLACE_EXISTING
            );

            return "http://localhost:8080/uploads/profile/" + savedFilename;

        } catch (IOException e) {
            e.printStackTrace();
            throw new RuntimeException("프로필 이미지 저장에 실패했습니다: " + e.getMessage());
        }
    }

    @GetMapping
    public List<UserResponseDto> getUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponseDto::new)
                .toList();
    }

    @GetMapping("/{userId}")
    public UserResponseDto getUser(@PathVariable Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        return new UserResponseDto(user);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody UserLoginRequestDto request) {
        if (request.getEmail() == null || request.getEmail().isBlank()) {
            throw new ValidationException("이메일을 입력해주세요.");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("비밀번호를 입력해주세요.");
        }
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );
        } catch (Exception e) {
            throw new AuthException("이메일 또는 비밀번호가 일치하지 않습니다.");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new AuthException("아이디 또는 비밀번호가 일치하지 않습니다."));

        String accessToken = jwtProvider.createAccessToken(user.getEmail());

        Map<String, Object> response = Map.of(
                "accessToken", accessToken,
                "userId", user.getUserId(),
                "email", user.getEmail(),
                "nickname", user.getNickname(),
                "profileImage", user.getProfileImage() == null ? "" : user.getProfileImage()
        );

        return ResponseEntity.ok(response);
    }
    @PatchMapping("/{userId}")
    public UserResponseDto updateUser(
            @PathVariable Long userId,
            @RequestParam("nickname") String nickname,
            @RequestParam(value = "profileImage", required = false) MultipartFile profileImage,
            Authentication authentication
    ) {
        if (nickname == null || nickname.isBlank()) {
            throw new ValidationException("닉네임을 입력해주세요.");
        }

        if (nickname.length() > 10) {
            throw new ValidationException("닉네임은 10자 이하로 입력해주세요.");
        }

        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!loginUser.getUserId().equals(userId)) {
            throw new ForbiddenException("회원정보 수정 권한이 없습니다.");
        }

        for (User user : userRepository.findAll()) {
            if (nickname.equals(user.getNickname()) && !user.getUserId().equals(userId)) {
                throw new ConflictException("중복된 닉네임입니다.");
            }
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));

        String profileImagePath = user.getProfileImage();

        if (profileImage != null && !profileImage.isEmpty()) {
            profileImagePath = saveProfileImage(profileImage);
        }

        user.updateProfile(nickname, profileImagePath);

        user = userRepository.save(user);

        return new UserResponseDto(user);
    }

    @Transactional
    @DeleteMapping("/{userId}")
    public String deleteUser(@PathVariable Long userId,
                             Authentication authentication) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("회원을 찾을 수 없습니다."));
        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!loginUser.getUserId().equals(userId)) {
            throw new ForbiddenException("회원 탈퇴 권한이 없습니다.");
        }
        Set<Post> affectedPosts = new HashSet<>();

        List<PostLike> likes = postLikeRepository.findByUser(user);

        for (PostLike like : likes) {
            affectedPosts.add(like.getPost());
        }

        List<Comment> comments = commentRepository.findAll();

        for (Comment comment : comments) {
            if (comment.getUser().getUserId().equals(userId)) {
                affectedPosts.add(comment.getPost());
            }
        }

        List<Post> myPosts = postRepository.findByUser(user);

        for (Post post : myPosts) {
            postLikeRepository.deleteByPost(post);
            commentRepository.deleteByPost(post);
        }

        postLikeRepository.deleteByUser(user);
        commentRepository.deleteByUser(user);

        for (Post post : myPosts) {
            postRepository.delete(post);
        }

        affectedPosts.removeAll(myPosts);

        for (Post post : affectedPosts) {
            post.setLikeCount((int) postLikeRepository.countByPost(post));
            post.setCommentCount((int) commentRepository.countByPost(post));

            postRepository.save(post);
        }

        userRepository.delete(user);

        return "회원 삭제 성공";
    }

    @PatchMapping("/me/password")
    public UserResponseDto updatePassword(
            @RequestBody PasswordUpdateRequestDto request,
            Authentication authentication
    ) {
        if (request.getCurrentPassword() == null || request.getCurrentPassword().isBlank()) {
            throw new ValidationException("현재 비밀번호를 입력해주세요.");
        }

        String email = authentication.getName();

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new ValidationException("현재 비밀번호가 일치하지 않습니다.");
        }

        if (request.getPassword() == null || request.getPassword().isBlank()) {
            throw new ValidationException("새 비밀번호를 입력해주세요.");
        }

        if (request.getPassword().length() < 8 || request.getPassword().length() > 20) {
            throw new ValidationException("비밀번호는 8자 이상, 20자 이하로 입력해주세요.");
        }

        String regex =
                "^(?=.*[a-z])" +
                        "(?=.*[A-Z])" +
                        "(?=.*\\d)" +
                        "(?=.*[!@#$%^&*])" +
                        ".+$";

        if (!request.getPassword().matches(regex)) {
            throw new ValidationException("비밀번호 입력 조건을 확인해주세요.");
        }

        if (request.getPasswordCheck() == null || request.getPasswordCheck().isBlank()) {
            throw new ValidationException("비밀번호 확인을 입력해주세요.");
        }

        if (!request.getPassword().equals(request.getPasswordCheck())) {
            throw new ValidationException("비밀번호 확인이 일치하지 않습니다.");
        }
        user.updatePassword(passwordEncoder.encode(request.getPassword()));

        user = userRepository.save(user);

        return new UserResponseDto(user);
    }
}
