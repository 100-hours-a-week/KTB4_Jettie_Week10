package org.example.ktb4_jettie_week4.controller;

import org.example.ktb4_jettie_week4.dto.*;
import org.example.ktb4_jettie_week4.entity.*;
import org.example.ktb4_jettie_week4.exception.*;
import org.example.ktb4_jettie_week4.repository.CommentRepository;
import org.example.ktb4_jettie_week4.repository.PostLikeRepository;
import org.example.ktb4_jettie_week4.repository.PostRepository;
import org.example.ktb4_jettie_week4.repository.UserRepository;
import org.example.ktb4_jettie_week4.service.PostImageStorageService;
import org.example.ktb4_jettie_week4.repository.HashtagRepository;
import org.example.ktb4_jettie_week4.entity.Hashtag;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.core.Authentication;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/posts")
public class PostController {

    private final PostRepository postRepository;
    private final CommentRepository commentRepository;
    private final UserRepository userRepository;
    private final PostLikeRepository postLikeRepository;
    private final PostImageStorageService postImageStorageService;
    private final HashtagRepository hashtagRepository;

    public PostController(
            PostRepository postRepository,
            CommentRepository commentRepository,
            UserRepository userRepository,
            PostLikeRepository postLikeRepository,
            HashtagRepository hashtagRepository,
            PostImageStorageService postImageStorageService
    ) {
        this.postRepository = postRepository;
        this.commentRepository = commentRepository;
        this.userRepository = userRepository;
        this.postLikeRepository = postLikeRepository;
        this.postImageStorageService = postImageStorageService;
        this.hashtagRepository = hashtagRepository;
    }

    // 게시글 목록 조회
    @GetMapping
    public Page<PostResponseDto> getPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Area area,
            @RequestParam(defaultValue = "latest-sort") String sort
    ) {
        PageRequest pageRequest = PageRequest.of(
                page,
                size,
                createPostSort(sort)
        );
        // 1. 지역 필터
        if (area != null) {
            return postRepository
                    .findByArea(area, pageRequest)
                    .map(PostResponseDto::new);
        }

        // 2. 전체 목록
        return postRepository
                .findAll(pageRequest)
                .map(PostResponseDto::new);
    }

    @GetMapping("/me")
    public Page<PostResponseDto> getMyPosts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "latest-sort") String sort,
            Authentication authentication
    ) {
        User loginUser = getAuthenticatedUser(authentication);
        PageRequest pageRequest = PageRequest.of(page, size, createPostSort(sort));

        return postRepository
                .findByUserUserId(loginUser.getUserId(), pageRequest)
                .map(PostResponseDto::new);
    }

    private Sort createPostSort(String sortOption) {
        return switch (sortOption) {
            case "latest-sort" -> Sort.by(
                    Sort.Order.desc("postCreatedAt"),
                    Sort.Order.desc("postId")
            );
            case "like-sort" -> Sort.by(
                    Sort.Order.desc("likeCount"),
                    Sort.Order.desc("postCreatedAt"),
                    Sort.Order.desc("postId")
            );
            case "view-sort" -> Sort.by(
                    Sort.Order.desc("viewCount"),
                    Sort.Order.desc("postCreatedAt"),
                    Sort.Order.desc("postId")
            );
            default -> throw new ValidationException("지원하지 않는 게시글 정렬 방식입니다.");
        };
    }

    // 게시글 상세 조회
    @GetMapping("/{postId}")
    public PostDetailResponseDto getPost(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));

        User user = getAuthenticatedUser(authentication);

        post.increaseViewCount();
        post = postRepository.save(post);

        boolean likedByMe = postLikeRepository.existsByPostAndUser(post, user);

        return new PostDetailResponseDto(post, likedByMe);
    }

    // 게시글 작성
    @PostMapping
    @Transactional
    public ResponseEntity<PostResponseDto> createPost(
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam Area area,
            @RequestParam List<MultipartFile> postImages,
            @RequestParam(required = false) List<String> hashtags,
            Authentication authentication
    ) {
        System.out.println("전달받은 해시태그: " + hashtags);

        validateHashtags(hashtags);

        if (title == null || title.isBlank()) {
            throw new ValidationException("제목을 입력해주세요.");
        }

        if (title.length() > 26) {
            throw new ValidationException(
                    "제목은 26자 이하로 입력해주세요."
            );
        }

        if (content == null || content.isBlank()) {
            throw new ValidationException("내용을 입력해주세요.");
        }

        if (postImages == null || postImages.isEmpty()) {
            throw new ValidationException(
                    "사진을 최소 한 장 선택해주세요."
            );
        }

        if (postImages.size() > 10) {
            throw new ValidationException(
                    "사진은 최대 10장까지 선택할 수 있습니다."
            );
        }

        User user = getAuthenticatedUser(authentication);

        List<String> savedPaths = new ArrayList<>();
        try {
            Post post = new Post(title, content, user, area);

            // 해시태그가 있을 때만 하나씩 조회 및 생성
            if (hashtags != null) {
                for (int index = 0; index < hashtags.size(); index++) { // 인덱스로 태그 하나씩 꺼냄
                    String hashtagName = hashtags.get(index);

                    Hashtag hashtag = findOrCreateHashtag(hashtagName);

                    // 연결 객체 생성 (어떤 게시글인가, 어떤 태그인가, 몇 번째 태그인가)
                    PostHashtag postHashtag = new PostHashtag(post, hashtag, index);

                    // 게시글 목록에 연결 객체 추가
                    post.addHashtag(postHashtag);

                    System.out.println(
                            "연결한 해시태그: "
                                    + hashtag.getName()
                                    + ", 순서="
                                    + index
                    );
                }
            }

            for (int index = 0; index < postImages.size(); index++) {
                String imagePath = postImageStorageService.save(postImages.get(index));
                savedPaths.add(imagePath);
                post.addImage(new PostImage(imagePath, index));
            }
            post = postRepository.saveAndFlush(post);
            return ResponseEntity.status(HttpStatus.CREATED).body(new PostResponseDto(post));
        } catch (RuntimeException exception) {
            savedPaths.forEach(this::deleteFileQuietly);
            throw exception;
        }
    }

    // 게시글 수정
    @PatchMapping("/{postId}")
    @Transactional
    public PostResponseDto updatePost(
            @PathVariable Long postId,
            @RequestParam String title,
            @RequestParam String content,
            @RequestParam Area area,
            @RequestParam(required = false) List<String> hashtags,
            @RequestParam(required = false) List<Long> retainedImageIds,
            @RequestParam(required = false) List<Long> deletedImageIds,
            @RequestParam(required = false) List<MultipartFile> newImages,
            @RequestParam(required = false) List<String> imageOrder,
            Authentication authentication
    ) {
        if (title == null || title.isBlank()) {
            throw new ValidationException("제목을 입력해주세요.");
        }

        if (title.length() > 26) {
            throw new ValidationException("제목은 26자 이하로 입력해주세요.");
        }

        if (content == null || content.isBlank()) {
            throw new ValidationException("내용을 입력해주세요.");
        }

        validateHashtags(hashtags);

        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));

        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!post.getUser().getUserId().equals(loginUser.getUserId())) {
            throw new AuthException("게시글 수정 권한이 없습니다.");
        }

        List<PostImage> originalImages = new ArrayList<>(post.getPostImages());
        Map<Long, PostImage> existingById = originalImages.stream()
                .collect(Collectors.toMap(PostImage::getImageId, image -> image));
        Set<Long> retained;
        if (retainedImageIds != null) {
            retained = new LinkedHashSet<>(retainedImageIds);
        } else if (imageOrder != null && !imageOrder.isEmpty()) {
            retained = imageOrder.stream()
                    .filter(token -> token.startsWith("existing:"))
                    .map(token -> Long.valueOf(token.substring("existing:".length())))
                    .collect(Collectors.toCollection(LinkedHashSet::new));
        } else {
            retained = new LinkedHashSet<>(existingById.keySet());
        }
        Set<Long> deleted = deletedImageIds == null
                ? Set.of()
                : new HashSet<>(deletedImageIds);

        if (!existingById.keySet().containsAll(retained)
                || !existingById.keySet().containsAll(deleted)) {
            throw new ValidationException("다른 게시글의 이미지가 포함되어 있습니다.");
        }
        if (!Collections.disjoint(retained, deleted)) {
            throw new ValidationException("유지 이미지와 삭제 이미지가 중복됩니다.");
        }

        List<MultipartFile> files = newImages == null ? List.of() : newImages;
        List<String> newPaths = new ArrayList<>();
        try {
            for (MultipartFile file : files) {
                newPaths.add(postImageStorageService.save(file));
            }
            List<PostImage> finalImages = buildFinalImageOrder(
                    originalImages, existingById, retained, deleted, newPaths, imageOrder
            );
            if (finalImages.isEmpty()) {
                throw new ValidationException("게시글 이미지는 최소 1장이어야 합니다.");
            }
            if (finalImages.size() > 10) {
                throw new ValidationException("게시글 이미지는 최대 10장까지 등록할 수 있습니다.");
            }

            Set<Long> finalExistingIds = finalImages.stream()
                    .map(PostImage::getImageId)
                    .filter(Objects::nonNull)
                    .collect(Collectors.toSet());
            List<String> removedPaths = originalImages.stream()
                    .filter(image -> !finalExistingIds.contains(image.getImageId()))
                    .map(PostImage::getImageUrl)
                    .toList();

            post.clearHashtags();
            postRepository.saveAndFlush(post);
            if (hashtags != null) {
                for (int index = 0; index < hashtags.size(); index++) {
                    Hashtag hashtag = findOrCreateHashtag(hashtags.get(index));
                    post.addHashtag(new PostHashtag(post, hashtag, index));
                }
            }

            post.updatePost(title, content, area);
            post.replaceImages(finalImages);
            post = postRepository.saveAndFlush(post);
            deleteFilesAfterCommit(removedPaths);
            return new PostResponseDto(post);
        } catch (RuntimeException exception) {
            newPaths.forEach(this::deleteFileQuietly);
            throw exception;
        }
    }

    // 게시글 삭제
    @Transactional
    @DeleteMapping("/{postId}")
    public String deletePost(@PathVariable Long postId, Authentication authentication) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));

        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!post.getUser().getUserId().equals(loginUser.getUserId())) {
            throw new AuthException("게시글 삭제 권한이 없습니다.");
        }
        postLikeRepository.deleteByPost(post);
        commentRepository.deleteByPost(post);

        List<String> imagePaths = post.getPostImages().stream()
                .map(PostImage::getImageUrl)
                .toList();
        postRepository.delete(post);
        deleteFilesAfterCommit(imagePaths);

        return "게시글 삭제 성공";
    }

    // 좋아요
    @PatchMapping("/{postId}/like")
    public PostDetailResponseDto increaseLike(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));

        User user = getAuthenticatedUser(authentication);

        if (!postLikeRepository.existsByPostAndUser(post, user)) {
            PostLike postLike = new PostLike(post, user);
            postLikeRepository.save(postLike);

            post.increaseLikeCount();
            post = postRepository.save(post);
        }

        return new PostDetailResponseDto(post, true);
    }

    // 좋아요 취소
    @PatchMapping("/{postId}/unlike")
    public PostDetailResponseDto decreaseLike(
            @PathVariable Long postId,
            Authentication authentication
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시글을 찾을 수 없습니다."));

        User user = getAuthenticatedUser(authentication);
        PostLike postLike = postLikeRepository.findByPostAndUser(post, user)
                .orElseThrow(() -> new NotFoundException("좋아요 정보를 찾을 수 없습니다."));
        postLikeRepository.delete(postLike);



        post.decreaseLikeCount();
        post = postRepository.save(post);

        return new PostDetailResponseDto(post, false);
    }

    // 댓글 목록 조회
    @GetMapping("/{postId}/comments")
    public List<CommentResponseDto> getComments(@PathVariable Long postId) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시물을 찾을 수 없습니다."));

        return commentRepository.findByPostOrderByCommentCreatedAtDesc(post)
                .stream()
                .map(CommentResponseDto::new)
                .toList();
    }

    // 댓글 작성
    @PostMapping("/{postId}/comments")
    public ResponseEntity<CommentResponseDto> createComment(
            @PathVariable Long postId,
            @RequestBody CommentCreateRequestDto request,
            Authentication authentication
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시물을 찾을 수 없습니다."));

        User user = getAuthenticatedUser(authentication);

        if (request.getCommentContent() == null || request.getCommentContent().isBlank()) {
            throw new ValidationException("댓글을 입력해주세요.");
        }

        Comment comment = new Comment(
                request.getCommentContent(),
                user,
                post
        );

        post.increaseCommentCount();
        postRepository.save(post);

        comment = commentRepository.save(comment);

        return ResponseEntity.status(HttpStatus.CREATED).body(new CommentResponseDto(comment));
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new AuthException("로그인이 필요합니다.");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));
    }

    // 댓글 삭제
    @DeleteMapping("/{postId}/comments/{commentId}")
    public String deleteComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            Authentication authentication
    ) {
        Post post = postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시물을 찾을 수 없습니다."));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("댓글을 찾을 수 없습니다."));
        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!comment.getUser().getUserId().equals(loginUser.getUserId())) {
            throw new AuthException("댓글 삭제 권한이 없습니다.");
        }

        commentRepository.delete(comment);

        post.decreaseCommentCount();
        postRepository.save(post);

        return "댓글 삭제 성공";
    }

    // 댓글 수정
    @PatchMapping("/{postId}/comments/{commentId}")
    public CommentResponseDto updateComment(
            @PathVariable Long postId,
            @PathVariable Long commentId,
            @RequestBody CommentUpdateRequestDto request,
            Authentication authentication
    ) {
        if (request.getCommentContent() == null || request.getCommentContent().isBlank()) {
            throw new ValidationException("댓글을 입력해주세요.");
        }

        postRepository.findById(postId)
                .orElseThrow(() -> new NotFoundException("게시물을 찾을 수 없습니다."));

        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new NotFoundException("댓글을 찾을 수 없습니다."));

        String email = authentication.getName();

        User loginUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new AuthException("인증된 사용자를 찾을 수 없습니다."));

        if (!comment.getUser().getUserId().equals(loginUser.getUserId())) {
            throw new AuthException("댓글 수정 권한이 없습니다.");
        }
        comment.updateComment(request.getCommentContent());

        comment = commentRepository.save(comment);

        return new CommentResponseDto(comment);
    }

    private List<PostImage> buildFinalImageOrder(
            List<PostImage> originalImages,
            Map<Long, PostImage> existingById,
            Set<Long> retained,
            Set<Long> deleted,
            List<String> newPaths,
            List<String> imageOrder
    ) {
        List<PostImage> result = new ArrayList<>();
        Set<Long> usedExisting = new HashSet<>();
        Set<Integer> usedNew = new HashSet<>();

        if (imageOrder == null || imageOrder.isEmpty()) {
            originalImages.stream()
                    .filter(image -> retained.contains(image.getImageId()))
                    .filter(image -> !deleted.contains(image.getImageId()))
                    .sorted(Comparator.comparingInt(PostImage::getImageOrder))
                    .forEach(result::add);
            for (int index = 0; index < newPaths.size(); index++) {
                result.add(new PostImage(newPaths.get(index), result.size()));
            }
            return result;
        }

        for (String token : imageOrder) {
            String[] parts = token.split(":", 2);
            if (parts.length != 2) throw new ValidationException("이미지 순서 형식이 올바르지 않습니다.");
            if ("existing".equals(parts[0])) {
                Long imageId = Long.valueOf(parts[1]);
                PostImage image = existingById.get(imageId);
                if (image == null || !retained.contains(imageId) || deleted.contains(imageId)
                        || !usedExisting.add(imageId)) {
                    throw new ValidationException("기존 이미지 순서가 올바르지 않습니다.");
                }
                result.add(image);
            } else if ("new".equals(parts[0])) {
                int index = Integer.parseInt(parts[1]);
                if (index < 0 || index >= newPaths.size() || !usedNew.add(index)) {
                    throw new ValidationException("새 이미지 순서가 올바르지 않습니다.");
                }
                result.add(new PostImage(newPaths.get(index), result.size()));
            } else {
                throw new ValidationException("이미지 순서 형식이 올바르지 않습니다.");
            }
        }
        if (usedExisting.size() != retained.size() || usedNew.size() != newPaths.size()) {
            throw new ValidationException("이미지 순서에 누락된 이미지가 있습니다.");
        }
        return result;
    }

    private void deleteFilesAfterCommit(List<String> paths) {
        if (!TransactionSynchronizationManager.isSynchronizationActive()) {
            paths.forEach(this::deleteFileQuietly);
            return;
        }
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCommit() {
                paths.forEach(PostController.this::deleteFileQuietly);
            }
        });
    }

    private void deleteFileQuietly(String path) {
        try {
            postImageStorageService.delete(path);
        } catch (RuntimeException exception) {
            System.err.println("이미지 파일 삭제 실패: " + path);
        }
    }

    private void validateHashtags(List<String> hashtags) {
        if (hashtags == null) {
            return;
        }

        if (hashtags.size() > 5) {
            throw new ValidationException(
                    "해시태그는 최대 5개까지 등록할 수 있습니다."
            );
        }

        Set<String> uniqueHashtags = new HashSet<>(hashtags);

        if (uniqueHashtags.size() != hashtags.size()) {
            throw new ValidationException(
                    "중복된 해시태그는 등록할 수 없습니다."
            );
        }

        for (String hashtag : hashtags) {
            if (hashtag == null || hashtag.isBlank()) {
                throw new ValidationException(
                        "빈 해시태그는 등록할 수 없습니다."
                );
            }
            if (hashtag.length() > 20) {
                throw new ValidationException(
                        "해시태그는 20자 이하로 입력해주세요."
                );
            }
            if (hashtag.contains(" ")) {
                throw new ValidationException(
                        "해시태그에는 공백을 포함할 수 없습니다."
                );
            }
            if (hashtag.contains("#")) {
                throw new ValidationException(
                        "해시태그 이름에는 #을 포함할 수 없습니다."
                );
            }
        }

    }
    private Hashtag findOrCreateHashtag(String hashtagName) {
        Optional<Hashtag> existingHashtag =
                hashtagRepository.findByName(hashtagName);

        if (existingHashtag.isPresent()) {
            return existingHashtag.get();
        }

        return hashtagRepository.save(
                new Hashtag(hashtagName)
        );
    }
}
