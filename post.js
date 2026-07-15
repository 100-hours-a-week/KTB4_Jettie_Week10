const backBtn = document.querySelector(".back-btn");

const postTitle = document.querySelector(".post-info-wrap .post-title");
const postWriter = document.querySelector(".post-creator span");
const postCreateDate = document.querySelector(".post-create-date");
const postContent = document.querySelector(".post-content");
const postImage = document.querySelector(".post-image");
const postActions = document.querySelector(".post-actions");

const likedCountBtn = document.querySelector("#liked-count-btn");
const params = new URLSearchParams(location.search);
const postId = params.get("postId");
const likedCount = document.querySelector("#liked-count");
const viewCount = document.querySelector("#view-count-btn span");
const commentCount = document.querySelector("#comment-count-btn span");

const userInfoBtn = document.querySelector(".user-info-btn");
const profileDropdown = document.querySelector(".profile-dropdown");
const logoutBtn = document.querySelector(".logout-btn");

const commentInput = document.querySelector("#comment-create");
const commentCreateBtn = document.querySelector(".comment-create-btn");
const comments = document.querySelector(".comments");

const postUpdateBtn = document.querySelector("#post-update-btn");

const postDeleteBtn = document.querySelector("#post-delete-btn");
const postDeleteModalOverlay = document.querySelector(".post-delete-modal-overlay");
const postDeleteCancelBtn = document.querySelector(".post-delete-cancel-btn");

const isLogin = localStorage.getItem("isLogin");
const loginUserId = Number(localStorage.getItem("userId"));

const commentDeleteModalOverlay = document.querySelector(".comment-delete-modal-overlay");
const commentDeleteCancelBtn = document.querySelector(".comment-delete-cancel-btn");
const commentDeleteConfirmBtn = document.querySelector(".comment-delete-confirm-btn");

let editingCommentId = null;
let deletingCommentId = null;
const postDeleteConfirmBtn = document.querySelector(".post-delete-confirm-btn");

const headerProfileImage = document.querySelector(".header-profile-image");
const postWriterProfileImage = document.querySelector(".post-writer-profile-image");
const loginUserProfileImage = localStorage.getItem("profileImage");

setProfileImage(headerProfileImage, loginUserProfileImage);
function setProfileImage(imgElement, profileImage) {
    if (!imgElement) return;

    if (profileImage && profileImage !== "null" && profileImage !== "undefined") {
        imgElement.src = profileImage;
        imgElement.style.display = "block";
    } else {
        imgElement.removeAttribute("src");
        imgElement.style.display = "none";
    }
}

if (isLogin !== "true") {
    userInfoBtn.style.display = "none";
    profileDropdown.style.display = "none";
}

backBtn.addEventListener("click", function () {
    location.href = "posts.html";
});

if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImage");
        localStorage.removeItem("accessToken");

        alert("로그아웃 되었습니다.");
        location.href = "login.html";
    });
}

if (postUpdateBtn) {
    postUpdateBtn.href = `post-update.html?postId=${postId}`;
}

if (postDeleteBtn) {
    postDeleteBtn.addEventListener("click", function () {
        postDeleteModalOverlay.classList.add("active");
    });
}

if (postDeleteCancelBtn) {
    postDeleteCancelBtn.addEventListener("click", function () {
        postDeleteModalOverlay.classList.remove("active");
    });
}
if (postDeleteConfirmBtn) {
    postDeleteConfirmBtn.addEventListener("click", async function () {
        try {
            const response = await apiFetch(`/posts/${postId}`, {
                method: "DELETE"
            });

            if (!response.ok) {
                const errorText = await response.text();

                console.error("게시글 삭제 실패 상태:", response.status);
                console.error("게시글 삭제 실패 응답:", errorText);

                alert("게시글 삭제에 실패했습니다.");
                return;
            }

            postDeleteModalOverlay.classList.remove("active");
            location.href = "posts.html";

        } catch (error) {
            console.error("게시글 삭제 요청 실패:", error);
            alert("서버와 연결할 수 없습니다.");
        }
    });
}

likedCountBtn.addEventListener("click", async function () {
    if (isLogin !== "true") {
        alert("로그인이 필요합니다.");
        location.href = "login.html";
        return;
    }

    try {
        let response;

        if (likedCountBtn.classList.contains("active")) {
            response = await apiFetch(`/posts/${postId}/unlike?userId=${loginUserId}`, {
            method: "PATCH"
            });
        } else {
            response = await apiFetch(`/posts/${postId}/like?userId=${loginUserId}`, {
            method: "PATCH"
        });
        }

        if (!response.ok) {
            alert("좋아요 처리에 실패했습니다.");
            return;
        }

        const post = await response.json();

        likedCount.textContent = post.likeCount;

        if (post.likedByMe) {
            likedCountBtn.classList.add("active");
        } else {
            likedCountBtn.classList.remove("active");
        }

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});

function getAreaLabel(area) {
    const areaLabels = {
        SEOUL: "서울",
        GYEONGGI: "경기",
        INCHEON: "인천",
        GANGWON: "강원",
        DAEJEON: "대전",
        SEJONG: "세종",
        CHUNGBUK: "충북",
        CHUNGNAM: "충남",
        DAEGU: "대구",
        GYEONGBUK: "경북",
        BUSAN: "부산",
        ULSAN: "울산",
        GYEONGNAM: "경남",
        GWANGJU: "광주",
        JEONBUK: "전북",
        JEONNAM: "전남",
        JEJU: "제주"
    };

    return areaLabels[area] ?? "지역 없음";
}

async function loadPostDetail() {
    if (postId === null) {
        alert("잘못된 접근입니다.");
        location.href = "posts.html";
        return;
    }

    if (isLogin !== "true") {
        alert("로그인이 필요합니다.");
        location.href = "login.html";
        return;
    }

    try {
        const response = await apiFetch(`/posts/${postId}?userId=${loginUserId}`);
        if (!response.ok) {
            alert("게시글을 불러오지 못했습니다.");
            location.href = "posts.html";
            return;
        }

        const post = await response.json();

        postTitle.innerHTML = `
            <span class="post-area">#${getAreaLabel(post.area)}</span>
            ${post.title}
        `;
        postWriter.textContent = post.writer;
        postCreateDate.textContent = post.postCreatedAt;
        postContent.textContent = post.content;

        likedCount.textContent = post.likeCount;
        viewCount.textContent = post.viewCount;
        commentCount.textContent = post.commentCount;
        setProfileImage(postWriterProfileImage, post.writerProfileImage);

        if (post.likedByMe) {
            likedCountBtn.classList.add("active");
        } else {
            likedCountBtn.classList.remove("active");
        }

        if (loginUserId === post.writerId) {
            postActions.style.display = "flex";
        } else {
            postActions.style.display = "none";
        }
        if (post.postImage) {
            const imageUrl = post.postImage.replace("http://localhost:8080", "");

            const imageResponse = await apiFetch(imageUrl);

            if (imageResponse.ok) {
                const imageBlob = await imageResponse.blob();
                const objectUrl = URL.createObjectURL(imageBlob);

                postImage.src = objectUrl;
                postImage.style.display = "block";
            } else {
                postImage.removeAttribute("src");
                postImage.style.display = "none";
            }
        } else {
            postImage.removeAttribute("src");
            postImage.style.display = "none";
        }

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
}

function createCommentElement(comment) {
    const commentBox = document.createElement("div");
    commentBox.className = "comment";

    let actionsHtml = "";

    if (loginUserId === comment.writerId) {
        actionsHtml = `
            <div class="comment-actions">
                <button class="comment-actions-btn comment-update-btn" data-comment-id="${comment.commentId}" data-comment-content="${comment.commentContent}">수정</button>
                <button class="comment-actions-btn comment-delete-btn" data-comment-id="${comment.commentId}">삭제</button>
            </div>
        `;
    }

    commentBox.innerHTML = `
    <div class="comment-info">
        <div class="comment-detail-info">
            <div class="profile-circle">
                <img class="profile-image comment-profile-image" alt="프로필사진">
            </div>
            <span class="comment-creator">${comment.writer}</span>
            <span class="comment-create-date">${comment.commentCreatedAt}</span>
        </div>
        <div class="comment-content">${comment.commentContent}</div>
    </div>
    ${actionsHtml}
`;

const commentProfileImage = commentBox.querySelector(".comment-profile-image");
setProfileImage(commentProfileImage, comment.writerProfileImage);

    return commentBox;
}

async function loadComments() {
    if (postId === null) {
        return;
    }

    try {
        const response = await apiFetch(`/posts/${postId}/comments`);

        if (!response.ok) {
            alert("댓글을 불러오지 못했습니다.");
            return;
        }

        const commentList = await response.json();

        comments.innerHTML = "";

        commentList.forEach(function (comment) {
            comments.append(createCommentElement(comment));
        });

        commentCount.textContent = commentList.length;

    } catch (error) {
        alert("댓글 서버와 연결할 수 없습니다.");
    }
}

commentInput.addEventListener("input", function () {
    if (commentInput.value.trim() !== "") {
        commentCreateBtn.classList.add("active");
    } else {
        commentCreateBtn.classList.remove("active");
    }
});

comments.addEventListener("click", function (event) {
    if (event.target.classList.contains("comment-update-btn")) {
        editingCommentId = event.target.dataset.commentId;
        commentInput.value = event.target.dataset.commentContent;
        commentCreateBtn.textContent = "댓글 수정";
        commentCreateBtn.classList.add("active");
        commentInput.focus();
    }

    if (event.target.classList.contains("comment-delete-btn")) {
        deletingCommentId = event.target.dataset.commentId;
        commentDeleteModalOverlay.classList.add("active");
    }
});

if (commentDeleteCancelBtn) {
    commentDeleteCancelBtn.addEventListener("click", function () {
        deletingCommentId = null;
        commentDeleteModalOverlay.classList.remove("active");
    });
}

if (commentDeleteConfirmBtn) {
    commentDeleteConfirmBtn.addEventListener("click", async function () {
        if (deletingCommentId === null) {
            return;
        }

        try {
            const response = await apiFetch(
                `/posts/${postId}/comments/${deletingCommentId}`, { method: "DELETE" }
            );

            if (!response.ok) {
                alert("댓글 삭제에 실패했습니다.");
                return;
            }

            deletingCommentId = null;
            commentDeleteModalOverlay.classList.remove("active");

            await loadComments();

        } catch (error) {
            alert("서버와 연결할 수 없습니다.");
        }
    });
}

commentCreateBtn.addEventListener("click", async function () {
    const content = commentInput.value.trim();

    if (isLogin !== "true") {
        alert("로그인이 필요합니다.");
        location.href = "login.html";
        return;
    }

    if (content === "") {
        alert("댓글을 입력해주세요.");
        return;
    }

    try {
        let response;

        if (editingCommentId !== null) {
            response = await apiFetch(`/posts/${postId}/comments/${editingCommentId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    commentContent: content
                })
            });
        } else {
            response = await apiFetch(`/posts/${postId}/comments`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: loginUserId,
                    commentContent: content
                })
            });
        }

        if (!response.ok) {
            alert("댓글 처리에 실패했습니다.");
            return;
        }

        commentInput.value = "";
        commentCreateBtn.textContent = "댓글 등록";
        commentCreateBtn.classList.remove("active");
        editingCommentId = null;

        await loadComments();

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});

loadPostDetail();
loadComments();