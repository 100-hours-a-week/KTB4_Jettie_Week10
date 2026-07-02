const params = new URLSearchParams(location.search);
const postId = params.get("postId");

const loginUserId = Number(localStorage.getItem("userId"));
const isLogin = localStorage.getItem("isLogin");
const loginUserProfileImage = localStorage.getItem("profileImage");

const backBtn = document.querySelector(".back-btn");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const postImageInput = document.querySelector("#post-image");
const postImagePreview = document.querySelector("#post-image-preview");
const postUpdateBtn = document.querySelector(".post-update-btn");
const postUpdateError = document.querySelector("#post-update-error");
const headerProfileImage = document.querySelector(".header-profile-image");

setProfileImage(headerProfileImage, loginUserProfileImage);

if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

backBtn.addEventListener("click", function () {
    location.href = `post.html?postId=${postId}`;
});

async function loadPostUpdateForm() {
    if (postId === null) {
        alert("잘못된 접근입니다.");
        location.href = "posts.html";
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/posts/${postId}?userId=${loginUserId}`);

        if (!response.ok) {
            alert("게시글을 불러오지 못했습니다.");
            location.href = "posts.html";
            return;
        }

        const post = await response.json();

        titleInput.value = post.title;
        contentInput.value = post.content;

        if (post.postImage) {
            postImagePreview.src = post.postImage;
            postImagePreview.style.display = "block";
        } else {
            postImagePreview.removeAttribute("src");
            postImagePreview.style.display = "none";
        }

        checkPostUpdateForm();

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
}

titleInput.addEventListener("input", function () {
    if (titleInput.value.length > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
    }

    postUpdateError.textContent = "";
    checkPostUpdateForm();
});

contentInput.addEventListener("input", function () {
    postUpdateError.textContent = "";
    checkPostUpdateForm();
});

postImageInput.addEventListener("change", function () {
    if (postImageInput.files.length === 0) {
        return;
    }

    const file = postImageInput.files[0];

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 선택할 수 있습니다.");
        postImageInput.value = "";
        return;
    }

    const previewUrl = URL.createObjectURL(file);
    postImagePreview.src = previewUrl;
    postImagePreview.style.display = "block";
});

function checkPostUpdateForm() {
    if (titleInput.value.trim() !== "" && contentInput.value.trim() !== "") {
        postUpdateBtn.classList.add("active");
    } else {
        postUpdateBtn.classList.remove("active");
    }
}

postUpdateBtn.addEventListener("click", async function () {
    if (titleInput.value.trim() === "" || contentInput.value.trim() === "") {
        postUpdateError.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    const formData = new FormData();

    formData.append("title", titleInput.value.trim());
    formData.append("content", contentInput.value.trim());

    if (postImageInput.files.length > 0) {
        formData.append("postImage", postImageInput.files[0]);
    }

    try {
        const response = await fetch(`http://localhost:8080/posts/${postId}`, {
            method: "PATCH",
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();
            alert(message);
            return;
        }

        location.href = `post.html?postId=${postId}`;

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});

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

loadPostUpdateForm();