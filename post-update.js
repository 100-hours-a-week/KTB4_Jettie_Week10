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

const areaInputs = document.querySelectorAll('input[name="area"]');

let previewObjectUrl = null;

setProfileImage(headerProfileImage, loginUserProfileImage);

if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

backBtn.addEventListener("click", function () {
    location.href = `post.html?postId=${postId}`;
});

async function loadPostUpdateForm() {
    if (!postId) {
        alert("잘못된 접근입니다.");
        location.href = "posts.html";
        return;
    }

    try {
        const response = await apiFetch(
            `/posts/${postId}?userId=${loginUserId}`
        );

        if (!response.ok) {
            alert("게시글을 불러오지 못했습니다.");
            location.href = "posts.html";
            return;
        }

        const post = await response.json();

        titleInput.value = post.title;
        contentInput.value = post.content;

        const savedAreaInput = document.querySelector(
            `input[name="area"][value="${post.area}"]`
        );

        if (savedAreaInput) {
            savedAreaInput.checked = true;
        }

        await loadPostImagePreview(post.postImage);

        checkPostUpdateForm();
    } catch (error) {
        console.error("게시글 수정 화면 조회 실패:", error);
        alert("서버와 연결할 수 없습니다.");
    }
}

async function loadPostImagePreview(imageUrl) {
    if (!imageUrl) {
        hidePostImagePreview();
        return;
    }

    try {
        const imagePath = imageUrl.startsWith("http://") ||
            imageUrl.startsWith("https://")
            ? new URL(imageUrl).pathname
            : imageUrl;

        const response = await apiFetch(imagePath);

        if (!response.ok) {
            throw new Error(`이미지 조회 실패: ${response.status}`);
        }

        const imageBlob = await response.blob();

        clearPreviewObjectUrl();

        previewObjectUrl = URL.createObjectURL(imageBlob);

        postImagePreview.src = previewObjectUrl;
        postImagePreview.style.display = "block";
    } catch (error) {
        console.error("기존 게시글 이미지 조회 실패:", error);
        hidePostImagePreview();
    }
}

function hidePostImagePreview() {
    clearPreviewObjectUrl();
    postImagePreview.removeAttribute("src");
    postImagePreview.style.display = "none";
}

function clearPreviewObjectUrl() {
    if (previewObjectUrl) {
        URL.revokeObjectURL(previewObjectUrl);
        previewObjectUrl = null;
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

areaInputs.forEach(function (areaInput) {
    areaInput.addEventListener("change", function () {
        postUpdateError.textContent = "";
        checkPostUpdateForm();
    });
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

    clearPreviewObjectUrl();

    previewObjectUrl = URL.createObjectURL(file);

    postImagePreview.src = previewObjectUrl;
    postImagePreview.style.display = "block";
});

function getSelectedArea() {
    const selectedAreaInput = document.querySelector(
        'input[name="area"]:checked'
    );

    if (!selectedAreaInput) {
        return null;
    }

    return selectedAreaInput.value;
}

function checkPostUpdateForm() {
    const hasTitle = titleInput.value.trim() !== "";
    const hasContent = contentInput.value.trim() !== "";
    const hasArea = getSelectedArea() !== null;

    if (hasTitle && hasContent && hasArea) {
        postUpdateBtn.classList.add("active");
    } else {
        postUpdateBtn.classList.remove("active");
    }
}

postUpdateBtn.addEventListener("click", async function () {
    const title = titleInput.value.trim();
    const content = contentInput.value.trim();
    const area = getSelectedArea();

    postUpdateError.textContent = "";

    if (title === "" || content === "") {
        postUpdateError.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    if (!area) {
        postUpdateError.textContent = "* 지역을 선택해주세요.";
        return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("content", content);
    formData.append("area", area);

    if (postImageInput.files.length > 0) {
        formData.append("postImage", postImageInput.files[0]);
    }

    try {
        const response = await apiFetch(`/posts/${postId}`, {
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
        console.error("게시글 수정 실패:", error);
        alert("서버와 연결할 수 없습니다.");
    }
});

function setProfileImage(imgElement, profileImage) {
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

window.addEventListener("beforeunload", function () {
    clearPreviewObjectUrl();
});

loadPostUpdateForm();