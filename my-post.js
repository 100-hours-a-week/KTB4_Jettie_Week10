const backBtn =document.querySelector(".back-btn");
const logoutBtn = document.querySelector(".logout-btn");
const myPostList = document.querySelector(".my-post-list");
const sortSelect = document.querySelector(".sort-select");
const userInfoBtn = document.querySelector(".user-info-btn");
const profileDropdown = document.querySelector(".profile-dropdown");
const headerProfileImage = document.querySelector(".header-profile-image");
const isLogin = localStorage.getItem("isLogin");
const loginUserId = Number(localStorage.getItem("userId"));
const loginUserProfileImage = localStorage.getItem("profileImage");

let page = 0;
const size = 10;
let isLoading = false;
let hasNext = true;

function setProfileImage(
    imgElement,
    profileImage
) {
    if (!imgElement) {
        return;
    }

    if (
        profileImage &&
        profileImage !== "null" &&
        profileImage !== "undefined"
    ) {
        imgElement.src = profileImage;
        imgElement.style.display = "block";
    } else {
        imgElement.removeAttribute("src");
        imgElement.style.display = "none";
    }
}

function formatCount(count) {
    if (count >= 1000) {
        return Math.floor(count / 1000) + "k";
    }

    return count;
}

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

async function setPostThumbnail(
    imgElement,
    postImagePath
) {
    if (!imgElement) {
        return;
    }

    if (
        !postImagePath ||
        postImagePath === "null" ||
        postImagePath === "undefined"
    ) {
        imgElement.removeAttribute("src");
        imgElement.style.display = "none";
        return;
    }

    try {
        const imageUrl =
            postImagePath.replace(
                "http://localhost:8080",
                ""
            );

        const imageResponse =
            await apiFetch(imageUrl);

        if (!imageResponse.ok) {
            console.error(
                "내 게시글 썸네일 요청 실패:",
                imageResponse.status,
                postImagePath
            );

            imgElement.removeAttribute("src");
            imgElement.style.display = "none";
            return;
        }

        const imageBlob =
            await imageResponse.blob();

        const objectUrl =
            URL.createObjectURL(imageBlob);

        imgElement.src = objectUrl;
        imgElement.style.display = "block";

    } catch (error) {
        console.error(
            "내 게시글 썸네일 표시 오류:",
            error
        );

        imgElement.removeAttribute("src");
        imgElement.style.display = "none";
    }
}

function createPostElement(post) {
    const postElement =
        document.createElement("article");

    postElement.className = "post";

    postElement.innerHTML = `
        <div class="post-info">
            <span class="post-area">
                #${getAreaLabel(post.area)}
            </span>

            <img class="main-photo" alt="게시글 대표 이미지" >

            <div class="post-title" data-id="${post.postId}">
                ${post.title}
            </div>

            <div class="post-count">
                <span>
                    좋아요 ${formatCount(post.likeCount)}
                </span>
                <span>
                    댓글 ${formatCount(post.commentCount)}
                </span>
                <span>
                    조회수 ${formatCount(post.viewCount)}
                </span>
            </div>

            <span class="post-create-date">
                ${post.postCreatedAt}
            </span>
        </div>
        <hr>
        <div class="post-creator-info">
            <div class="profile-circle">
                <img class="profile-image post-writer-profile-image" alt="프로필사진">
            </div>
            <div class="post-creator">
                ${post.writer}
            </div>
        </div>
    `;

    const postWriterProfileImage =
        postElement.querySelector(".post-writer-profile-image");

    setProfileImage(postWriterProfileImage, post.writerProfileImage);

    const mainPhoto = postElement.querySelector(".main-photo");

    setPostThumbnail(mainPhoto, post.postImage);

    postElement.addEventListener(
        "click",
        function () {
            location.href =
                `post.html?postId=${post.postId}`;
        }
    );

    return postElement;
}

async function loadMyPosts() {
    if (isLoading || !hasNext) {
        return;
    }

    isLoading = true;

    try {
        const response =
            await apiFetch(
                `/posts?page=${page}&size=${size}&userId=${loginUserId}`
            );

        if (!response.ok) {
            const errorText =
                await response.text();

            console.error(
                "내 게시글 목록 요청 실패:",
                response.status,
                errorText
            );

            alert(
                "내 게시글을 불러오지 못했습니다."
            );

            return;
        }

        const data = await response.json();

        const posts = data.content;

        console.log(
            "내 게시글 목록:",
            posts
        );

        if ( page === 0 && posts.length === 0) {
            myPostList.innerHTML = `
                <p class="empty-message">작성한 게시글이 없습니다.</p>
            `;

            hasNext = false;
            return;
        }

        posts.forEach(function (post) {
            const postElement = createPostElement(post);

            myPostList.appendChild(
                postElement
            );
        });

        hasNext = !data.last;
        page++;

    } catch (error) {
        console.error(
            "내 게시글 목록 조회 또는 렌더링 오류:",
            error
        );

        alert(
            "내 게시글을 표시하는 중 오류가 발생했습니다."
        );
    } finally {
        isLoading = false;
    }
}

if ( isLogin !== "true" || !loginUserId ) {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
} else {
    setProfileImage(
        headerProfileImage,
        loginUserProfileImage
    );

    loadMyPosts();
}

if (backBtn) {
    backBtn.addEventListener(
        "click",
        function () {
            location.href = "posts.html";
        }
    );
}

if (logoutBtn) {
    logoutBtn.addEventListener(
        "click",
        function () {
            localStorage.removeItem("isLogin");
            localStorage.removeItem("userId");
            localStorage.removeItem("email");
            localStorage.removeItem("nickname");
            localStorage.removeItem("profileImage");
            localStorage.removeItem("accessToken");

            alert("로그아웃 되었습니다.");

            location.href = "login.html";
        }
    );
}

window.addEventListener(
    "scroll",
    function () {
        const scrollTop =
            window.scrollY;

        const windowHeight =
            window.innerHeight;

        const documentHeight =
            document.documentElement.scrollHeight;

        if (
            scrollTop + windowHeight >=
            documentHeight - 100
        ) {
            loadMyPosts();
        }
    }
);