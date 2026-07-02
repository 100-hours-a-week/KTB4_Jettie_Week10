const backBtn = document.querySelector(".back-btn");
const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");
const postImageInput = document.querySelector("#post-image");
const postImagePreview = document.querySelector("#post-image-preview");
const postCreateBtn = document.querySelector(".post-create-btn");
const postCreateError = document.querySelector("#post-create-error");

const headerProfileImage = document.querySelector(".header-profile-image");

const isLogin = localStorage.getItem("isLogin");
const loginUserProfileImage = localStorage.getItem("profileImage");

setProfileImage(headerProfileImage, loginUserProfileImage);

if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

backBtn.addEventListener("click", function () {
    location.href = "posts.html";
});

titleInput.addEventListener("input", function () {
    if (titleInput.value.length > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
    }

    postCreateError.textContent = "";
    checkPostCreateForm();
});

contentInput.addEventListener("input", function () {
    postCreateError.textContent = "";
    checkPostCreateForm();
});

postImageInput.addEventListener("change", function () {
    if (postImageInput.files.length === 0) {
        postImagePreview.removeAttribute("src");
        postImagePreview.style.display = "none";
        return;
    }

    const file = postImageInput.files[0];

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 선택할 수 있습니다.");
        postImageInput.value = "";
        postImagePreview.removeAttribute("src");
        postImagePreview.style.display = "none";
        return;
    }

    const previewUrl = URL.createObjectURL(file);
    postImagePreview.src = previewUrl;
    postImagePreview.style.display = "block";
});

function checkPostCreateForm() {
    const isTitleValid = titleInput.value.trim() !== "";
    const isContentValid = contentInput.value.trim() !== "";

    if (isTitleValid && isContentValid) {
        postCreateBtn.classList.add("active");
    } else {
        postCreateBtn.classList.remove("active");
    }
}

postCreateBtn.addEventListener("click", async function () {
    if (
        titleInput.value.trim() === "" ||
        contentInput.value.trim() === ""
    ) {
        postCreateError.textContent = "* 제목, 내용을 모두 작성해주세요.";
        return;
    }

    postCreateBtn.disabled = true;

    const formData = new FormData();

    formData.append("title", titleInput.value.trim());
    formData.append("content", contentInput.value.trim());
    formData.append("userId", Number(localStorage.getItem("userId")));

    if (postImageInput.files.length > 0) {
        formData.append("postImage", postImageInput.files[0]);
    }

    console.log("title:", formData.get("title"));
    console.log("content:", formData.get("content"));
    console.log("userId:", formData.get("userId"));
    console.log("postImage:", formData.get("postImage"));

    try {
        const response = await fetch("http://localhost:8080/posts", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();
            alert(message);
            postCreateBtn.disabled = false;
            return;
        }

        location.href = "posts.html";

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
        postCreateBtn.disabled = false;
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