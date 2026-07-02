
const loginBtn = document.querySelector(".login-btn");
const emailInput = document.querySelector("#email");
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordInput = document.querySelector("#password");
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;
const errorMessage = document.querySelector("#error-message");

function checkLoginForm() {
    const isEmailValid = emailPattern.test(emailInput.value.trim());
    const isPasswordValid = passwordPattern.test(passwordInput.value.trim());
    if (isEmailValid && isPasswordValid) { loginBtn.classList.add("active"); }
    else { loginBtn.classList.remove("active"); }
}
emailInput.addEventListener("input", checkLoginForm);
passwordInput.addEventListener("input", checkLoginForm);

loginBtn.addEventListener("click", async function () {

    if (emailInput.value.trim() === "") {
        errorMessage.textContent = "* 이메일을 입력해주세요.";
        return;
    }
    if (!emailPattern.test(emailInput.value.trim())) {
        errorMessage.textContent = "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)";
        return;
    }
    if (passwordInput.value.trim() === "") {
        errorMessage.textContent = "* 비밀번호를 입력해주세요.";
        return;
    }
    if (!passwordPattern.test(passwordInput.value.trim())) {
        errorMessage.textContent = "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.";
        return;
    }

    errorMessage.textContent = "";

    if(!loginBtn.classList.contains("active")) {
        return;
    }

    const requestBody = {
        email: emailInput.value.trim(),
        password: passwordInput.value.trim()
    };

    try {
        const response = await fetch("http://localhost:8080/users/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const message = await response.text();
            errorMessage.textContent = "* 아이디 또는 비밀번호가 일치하지 않습니다.";
            return;
        }

        const result = await response.json();

        localStorage.setItem("isLogin", "true");
        localStorage.setItem("userId", result.userId);
        localStorage.setItem("email", result.email);
        localStorage.setItem("nickname", result.nickname);
        localStorage.setItem("profileImage", result.profileImage || "");

        alert("로그인 성공!");
        location.href = "posts.html";
    } catch (error) {
        alert("서버와 연결할 수 없습니다.");
    }
});