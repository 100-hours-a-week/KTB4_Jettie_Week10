const emailText = document.querySelector("#email");
const nicknameInput = document.querySelector("#nickname");
const nicknameError = document.querySelector("#nickname-error");

const userUpdateBtn = document.querySelector(".user-update-btn");

const userDeleteBtn = document.querySelector(".user-delete-btn");
const userDeleteModalOverlay = document.querySelector(".user-delete-modal-overlay");
const userDeleteCancelBtn = document.querySelector(".user-delete-cancel-btn");
const userDeleteConfirmBtn = document.querySelector(".user-delete-confirm-btn");

const userUpdateComplete = document.querySelector(".user-update-complete");

const headerProfileImage = document.querySelector(".header-profile-image");
const userProfilePreview = document.querySelector(".user-profile-preview");
const profileImageInput = document.querySelector("#profile-image");
const profileImageText = document.querySelector(".profile-image-text");
const logoutBtn = document.querySelector(".logout-btn");

const userId = Number(localStorage.getItem("userId"));
const isLogin = localStorage.getItem("isLogin");

let originalNickname = "";

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
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

async function loadUserInfo() {
    try {
        const response = await apiFetch(`/users/${userId}`);

        if (!response.ok) {
            alert("회원 정보를 불러오지 못했습니다.");
            return;
        }

        const user = await response.json();

        emailText.textContent = user.email;
        nicknameInput.value = user.nickname;

        setProfileImage(headerProfileImage, user.profileImage);
        setProfileImage(userProfilePreview, user.profileImage);

        if (user.profileImage) {
            profileImageText.style.display = "none";
        } else {
            profileImageText.style.display = "block";
        }

        localStorage.setItem("profileImage", user.profileImage || "");

        originalNickname = user.nickname;
        checkNickname();

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
}

function checkNickname() {
    const nickname = nicknameInput.value.trim();

    if (nickname === "") {
        nicknameError.textContent = "* 닉네임을 입력해주세요.";
        userUpdateBtn.classList.remove("active");
        return false;
    }

    if (nickname.length > 10) {
        nicknameError.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        userUpdateBtn.classList.remove("active");
        return false;
    }

    if (nickname === originalNickname && profileImageInput.files.length === 0) {
        nicknameError.textContent = "";
        userUpdateBtn.classList.remove("active");
        return false;
    }

    nicknameError.textContent = "";
    userUpdateBtn.classList.add("active");
    return true;
}

nicknameInput.addEventListener("input", function () {
    checkNickname();
});

profileImageInput.addEventListener("change", function () {
    if (profileImageInput.files.length === 0) {
        checkNickname();
        return;
    }

    const file = profileImageInput.files[0];

    if (!file.type.startsWith("image/")) {
        alert("이미지 파일만 선택할 수 있습니다.");
        profileImageInput.value = "";
        checkNickname();
        return;
    }

    const previewUrl = URL.createObjectURL(file);

    setProfileImage(userProfilePreview, previewUrl);
    setProfileImage(headerProfileImage, previewUrl);

    profileImageText.style.display = "none";
    userUpdateBtn.classList.add("active");
});

userUpdateBtn.addEventListener("click", async function () {
    if (!userUpdateBtn.classList.contains("active")) {
        return;
    }

    const formData = new FormData();
    formData.append("nickname", nicknameInput.value.trim());
    if (profileImageInput.files.length > 0) {
        formData.append("profileImage", profileImageInput.files[0]);
    }

    try {
        const response = await apiFetch(`/users/${userId}`, {
            method: "PATCH",
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();

            if (message.includes("중복된 닉네임")) {
                nicknameError.textContent = "* 중복된 닉네임입니다.";
                userUpdateBtn.classList.remove("active");
                return;
            }

            alert(message);
            return;
        }

        const updatedUser = await response.json();

        localStorage.setItem("nickname", updatedUser.nickname);
        localStorage.setItem("profileImage", updatedUser.profileImage || "");   

        originalNickname = updatedUser.nickname;
        nicknameInput.value = updatedUser.nickname;

        userUpdateBtn.classList.remove("active");
        profileImageInput.value = "";
        setProfileImage(headerProfileImage, updatedUser.profileImage);
        setProfileImage(userProfilePreview, updatedUser.profileImage);

        userUpdateComplete.classList.add("active");

        setTimeout(function () {
            userUpdateComplete.classList.remove("active");
        }, 2000);

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});

if (logoutBtn) {
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

userDeleteBtn.addEventListener("click", function () {
    userDeleteModalOverlay.classList.add("active");
});

userDeleteCancelBtn.addEventListener("click", function () {
    userDeleteModalOverlay.classList.remove("active");
});

userDeleteConfirmBtn.addEventListener("click", async function () {
    try {
        const response = await apiFetch(`/users/${userId}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            alert("회원 탈퇴에 실패했습니다.");
            return;
        }

        localStorage.removeItem("isLogin");
        localStorage.removeItem("userId");
        localStorage.removeItem("email");
        localStorage.removeItem("nickname");
        localStorage.removeItem("profileImage");
        localStorage.removeItem("accessToken");

        alert("회원 탈퇴가 완료되었습니다.");
        location.href = "login.html";

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});

loadUserInfo();