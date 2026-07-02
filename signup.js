const backBtn = document.querySelector(".back-btn");
const signupBtn = document.querySelector(".signup-btn");

const profileImageInput = document.querySelector("#profile-image");
const profileImageError = document.querySelector("#profile-image-error");

const emailInput = document.querySelector("#email");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailError = document.querySelector("#email-error");

const passwordInput = document.querySelector("#password");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
const passwordError = document.querySelector("#password-error");

const passwordCheckInput = document.querySelector("#password-check");
const passwordCheckError = document.querySelector("#password-check-error");

const nicknameInput = document.querySelector("#nickname");
const nicknameError = document.querySelector("#nickname-error");

const profileImageUpload = document.querySelector(".profile-image-upload");
const profileImagePlus = document.querySelector(".profile-image-plus");

backBtn.addEventListener("click", function () {
    location.href = "login.html";
});

function checkSignupForm() {
    const isEmailValid = emailPattern.test(emailInput.value.trim());
    const isPasswordValid = passwordPattern.test(passwordInput.value.trim());
    const isPasswordCheckValid =
        passwordCheckInput.value.trim() !== "" &&
        passwordInput.value === passwordCheckInput.value;
    const isNicknameValid =
        nicknameInput.value.trim() !== "" &&
        !nicknameInput.value.includes(" ") &&
        nicknameInput.value.length <= 10;

    if (isEmailValid && isPasswordValid && isPasswordCheckValid && isNicknameValid) {
        signupBtn.classList.add("active");
    } else {
        signupBtn.classList.remove("active");
    }
}

profileImageInput.addEventListener("change", function () {
    if (profileImageInput.files.length === 0) {
        profileImageUpload.style.backgroundImage = "";
        profileImagePlus.style.display = "block";
        return;
    }

    const file = profileImageInput.files[0];

    if (!file.type.startsWith("image/")) {
        profileImageError.textContent = "* 이미지 파일만 선택할 수 있습니다.";
        profileImageInput.value = "";
        return;
    }

    profileImageError.textContent = "";

    const previewUrl = URL.createObjectURL(file);
    profileImageUpload.style.backgroundImage = `url(${previewUrl})`;
    profileImageUpload.style.backgroundSize = "cover";
    profileImageUpload.style.backgroundPosition = "center";
    profileImagePlus.style.display = "none";

    checkSignupForm();
});

emailInput.addEventListener("blur", function () {
    if (emailInput.value.trim() === "") {
        emailError.textContent = "* 이메일을 입력해주세요.";
        return;
    }

    if (!emailPattern.test(emailInput.value.trim())) {
        emailError.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
        return;
    }

    emailError.textContent = "";
});

emailInput.addEventListener("input", function () {
    emailError.textContent = "";
    checkSignupForm();
});

passwordInput.addEventListener("blur", function () {
    if (passwordInput.value.trim() === "") {
        passwordError.textContent = "* 비밀번호를 입력해주세요.";
        return;
    }

    if (!passwordPattern.test(passwordInput.value.trim())) {
        passwordError.textContent =
            "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        return;
    }

    passwordError.textContent = "";
});

passwordInput.addEventListener("input", function () {
    passwordError.textContent = "";
    checkSignupForm();
});

passwordCheckInput.addEventListener("blur", function () {
    if (passwordCheckInput.value.trim() === "") {
        passwordCheckError.textContent = "* 비밀번호를 한 번 더 입력해주세요.";
        return;
    }

    if (passwordCheckInput.value !== passwordInput.value) {
        passwordCheckError.textContent = "* 비밀번호가 다릅니다.";
        return;
    }

    passwordCheckError.textContent = "";
});

passwordCheckInput.addEventListener("input", function () {
    passwordCheckError.textContent = "";
    checkSignupForm();
});

nicknameInput.addEventListener("blur", function () {
    if (nicknameInput.value.trim() === "") {
        nicknameError.textContent = "* 닉네임을 입력해주세요.";
        return;
    }

    if (nicknameInput.value.includes(" ")) {
        nicknameError.textContent = "* 띄어쓰기를 없애주세요.";
        return;
    }

    if (nicknameInput.value.length > 10) {
        nicknameError.textContent = "* 닉네임은 최대 10자까지 작성 가능합니다.";
        return;
    }

    nicknameError.textContent = "";
});

nicknameInput.addEventListener("input", function () {
    nicknameError.textContent = "";
    checkSignupForm();
});

signupBtn.addEventListener("click", async function () {
    if (!signupBtn.classList.contains("active")) {
        return;
    }

    const formData = new FormData();
    formData.append("email", emailInput.value.trim());
    formData.append("password", passwordInput.value.trim());
    formData.append("nickname", nicknameInput.value.trim());

    if (profileImageInput.files.length > 0) {
        formData.append("profileImage", profileImageInput.files[0]);
    }

    try {
        const response = await fetch("http://localhost:8080/users/signup", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const message = await response.text();

            if (message.includes("중복된 이메일")) {
                emailError.textContent = "* 중복된 이메일입니다.";
                return;
            }

            if (message.includes("중복된 닉네임")) {
                nicknameError.textContent = "* 중복된 닉네임입니다.";
                return;
            }

            alert(message);
            return;
        }

        alert("회원가입 성공!");
        location.href = "login.html";

    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});