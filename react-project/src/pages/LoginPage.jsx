import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import "./LoginPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trimmedEmail = email.trim();
  const trimmedPassword = password.trim();

  const isEmailValid = EMAIL_PATTERN.test(trimmedEmail);
  const isPasswordValid = PASSWORD_PATTERN.test(trimmedPassword);

  const isFormValid = isEmailValid && isPasswordValid;

  function handleEmailChange(event) {
    setEmail(event.target.value);
    setErrorMessage("");
  }

  function handlePasswordChange(event) {
    setPassword(event.target.value);
    setErrorMessage("");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (trimmedEmail === "") {
      setErrorMessage("* 이메일을 입력해주세요.");
      return;
    }

    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setErrorMessage(
        "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)",
      );
      return;
    }

    if (trimmedPassword === "") {
      setErrorMessage("* 비밀번호를 입력해주세요.");
      return;
    }

    if (!PASSWORD_PATTERN.test(trimmedPassword)) {
      setErrorMessage(
        "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다.",
      );
      return;
    }

    if (isSubmitting) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    const requestBody = {
      email: trimmedEmail,
      password: trimmedPassword,
    };

    try {
      const response = await fetch("/api/users/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        setErrorMessage("* 아이디 또는 비밀번호가 일치하지 않습니다.");
        return;
      }

      const result = await response.json();

      console.log("login response:", result);

      const accessToken = result.accessToken || result.token;

      if (!accessToken) {
        alert(
          "로그인 응답에 토큰이 없습니다. 백엔드 로그인 응답을 확인해야 합니다.",
        );
        return;
      }

      login({
        accessToken,
        userId: result.userId,
        email: result.email,
        nickname: result.nickname,
        profileImage: result.profileImage,
      });

      alert("로그인 성공!");

      navigate("/posts");
    } catch (error) {
      console.error("로그인 요청 실패:", error);
      alert("서버와 연결할 수 없습니다.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="login-container">
      <header className="title">
        <Link to="/posts" className="home-link">
          <h1>여행발자국</h1>
        </Link>
      </header>

      <hr className="main-hr" />

      <section className="content">
        <h2>로그인</h2>

        <form className="detail-content" onSubmit={handleSubmit} noValidate>
          <div className="input-container">
            <label htmlFor="email">이메일</label>

            <input
              type="email"
              id="email"
              placeholder="이메일을 입력하세요."
              value={email}
              onChange={handleEmailChange}
              autoComplete="email"
            />
          </div>

          <div className="input-container">
            <label htmlFor="password">비밀번호</label>

            <input
              type="password"
              id="password"
              placeholder="비밀번호를 입력하세요."
              value={password}
              onChange={handlePasswordChange}
              autoComplete="current-password"
            />
          </div>

          <div className="error-message">{errorMessage}</div>

          <button
            type="submit"
            className={`login-btn ${isFormValid ? "active" : ""}`}
            disabled={!isFormValid || isSubmitting}
          >
            {isSubmitting ? "로그인 중..." : "로그인"}
          </button>

          <Link className="signup-link" to="/signup">
            회원가입
          </Link>
        </form>
      </section>
    </main>
  );
}

export default LoginPage;
