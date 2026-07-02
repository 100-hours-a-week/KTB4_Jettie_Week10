const postCreateBtn = document.querySelector(".post-create-btn");
const logoutBtn = document.querySelector(".logout-btn");
const postList = document.querySelector(".post-list");

const userInfoBtn = document.querySelector(".user-info-btn");
const profileDropdown = document.querySelector(".profile-dropdown");

const isLogin = localStorage.getItem("isLogin");

let page = 0;
const size = 10;
let isLoading = false;
let hasNext = true;

const headerProfileImage = document.querySelector(".header-profile-image");
const loginUserProfileImage = localStorage.getItem("profileImage");

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

setProfileImage(headerProfileImage, loginUserProfileImage);

if (isLogin !== "true") {
    userInfoBtn.style.display = "none";
    profileDropdown.style.display = "none";
} else if (logoutBtn) {
    logoutBtn.addEventListener("click", function () {
        localStorage.removeItem("isLogin");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImage");

        alert("로그아웃 되었습니다.");
        location.href = "login.html";
    });
}

function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + "k";
    }

    return count;
}

postCreateBtn.addEventListener("click", function (event) {
    event.preventDefault();

    if (isLogin !== "true") {
        alert("로그인이 필요합니다.");
        location.href = "login.html";
        return;
    }

    location.href = "post-create.html";
});

async function loadPosts() {
    if (isLoading || !hasNext) {
        return;
    }

    isLoading = true;

    try {
        const response = await fetch(`http://localhost:8080/posts?page=${page}&size=${size}`);

        if (!response.ok) {
            alert("게시글 목록을 불러오지 못했습니다.");
            return;
        }

        const data = await response.json();
        const posts = data.content;

        posts.forEach(function (post) {
            const postElement = document.createElement("div");
            postElement.className = "post";

            postElement.innerHTML = `
                <div class="post-info">
                    <div class="post-title" data-id="${post.postId}">
                        ${post.title}
                    </div>
                    <div class="post-detail-info">
                        <div class="post-count">
                            <span>좋아요 ${formatCount(post.likeCount)}</span>
                            <span>댓글 ${formatCount(post.commentCount)}</span>
                            <span>조회수 ${formatCount(post.viewCount)}</span>
                        </div>
                        <span class="post-create-date">${post.postCreatedAt}</span>
                    </div>  
                </div>
                <hr>
                <div class="post-creator-info">
                    <div class="profile-circle">
                        <img class="profile-image post-writer-profile-image" alt="프로필사진">
                    </div>
                    <div class="post-creator">${post.writer}</div>
                </div>
            `;
            const postWriterProfileImage = postElement.querySelector(".post-writer-profile-image");
            setProfileImage(postWriterProfileImage, post.writerProfileImage);   

            postElement.addEventListener("click", function () {
                location.href = `post.html?postId=${post.postId}`;
            });

            postList.appendChild(postElement);
        });

        hasNext = !data.last;
        page++;

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    } finally {
        isLoading = false;
    }
}

window.addEventListener("scroll", function () {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 100) {
        loadPosts();
    }
});

loadPosts();