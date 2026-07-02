const passwordInput = document.querySelector("#password");
const passwordCheckInput = document.querySelector("#password-check");

const passwordError = document.querySelector("#password-error");
const passwordCheckError = document.querySelector("#password-check-error");

const passwordUpdateBtn = document.querySelector(".password-update-btn");
const passwordUpdateComplete = document.querySelector(".password-update-complete");

const headerProfileImage = document.querySelector(".header-profile-image");
const logoutBtn = document.querySelector(".logout-btn");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

const userId = Number(localStorage.getItem("userId"));
const isLogin = localStorage.getItem("isLogin");
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
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

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

function checkPasswordUpdateForm() {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    const isPasswordValid = passwordPattern.test(password);
    const isPasswordCheckValid = passwordCheck !== "" && passwordCheck === password;

    if (isPasswordValid && isPasswordCheckValid) {
        passwordUpdateBtn.classList.add("active");
    } else {
        passwordUpdateBtn.classList.remove("active");
    }
}

passwordInput.addEventListener("blur", function () {
    const password = passwordInput.value.trim();

    if (password === "") {
        passwordError.textContent = "* 비밀번호를 입력해주세요.";
        return;
    }

    if (!passwordPattern.test(password)) {
        passwordError.textContent =
            "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        return;
    }

    passwordError.textContent = "";
});

passwordCheckInput.addEventListener("blur", function () {
    const password = passwordInput.value.trim();
    const passwordCheck = passwordCheckInput.value.trim();

    if (passwordCheck === "") {
        passwordCheckError.textContent = "* 비밀번호를 한 번 더 입력해주세요.";
        return;
    }

    if (passwordCheck !== password) {
        passwordCheckError.textContent = "* 비밀번호가 다릅니다.";
        return;
    }

    passwordCheckError.textContent = "";
});

passwordInput.addEventListener("input", function () {
    passwordError.textContent = "";
    checkPasswordUpdateForm();
});

passwordCheckInput.addEventListener("input", function () {
    passwordCheckError.textContent = "";
    checkPasswordUpdateForm();
});

passwordUpdateBtn.addEventListener("click", async function () {
    if (!passwordUpdateBtn.classList.contains("active")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:8080/users/${userId}/password`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                password: passwordInput.value.trim(),
                passwordCheck: passwordCheckInput.value.trim()
            })
        });

        if (!response.ok) {
            const message = await response.text();
            alert(message);
            return;
        }

        passwordInput.value = "";
        passwordCheckInput.value = "";
        passwordUpdateBtn.classList.remove("active");

        passwordUpdateComplete.classList.add("active");

        setTimeout(function () {
            passwordUpdateComplete.classList.remove("active");
        }, 2000);

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});