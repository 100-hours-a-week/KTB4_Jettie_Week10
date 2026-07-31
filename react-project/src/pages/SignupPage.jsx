import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./SignupPage.css";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

function SignupPage() {
    const navigate = useNavigate();

    function handleBackClick() {
        if ((window.history.state?.idx ?? 0) > 0) {
            navigate(-1);
            return;
        }

        navigate("/login", { replace: true });
    }
    const [profileImage, setProfileImage] = useState(null);
    const [profileImageError, setProfileImageError] = useState("");

    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");
    
    const [password, setPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");

    const [passwordCheck, setPasswordCheck] = useState("");
    const [passwordCheckError, setPasswordCheckError] = useState("");

    const [nickname, setNickname] = useState("");
    const [nicknameError, setNicknameError] = useState("");

    const isEmailValid = EMAIL_PATTERN.test(email.trim());
    const isPasswordValid = PASSWORD_PATTERN.test(password.trim());

    const isPasswordCheckValid =
    passwordCheck.trim() !== "" &&
    password === passwordCheck;

    const isNicknameValid =
    nickname.trim() !== "" &&
    !nickname.includes(" ") &&
    nickname.length <= 10;

    const [previewUrl, setPreviewUrl] = useState("");

    function handleProfileImageChange(event) {
        const file = event.target.files?.[0];

        if (!file) {
            setProfileImage(null);
            setPreviewUrl("");
            return;
        }

        if (!file.type.startsWith("image/")) {
            setProfileImageError("* 이미지 파일만 선택할 수 있습니다.");
            setProfileImage(null);
            setPreviewUrl("");
            event.target.value = "";
            return;
        }

        setProfileImageError("");
        setProfileImage(file);

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        }

    const isFormValid = isEmailValid && isPasswordValid && isPasswordCheckValid && isNicknameValid;

    function handleEmailBlur() {
        if (email.trim() === "") {
            setEmailError("* 이메일을 입력해주세요.");
            return;
        }

        if (!EMAIL_PATTERN.test(email.trim())) {
            setEmailError(
            "* 올바른 이메일 주소 형식을 입력해주세요. (예: example@adapterz.kr)"
            );
            return;
        }

        setEmailError("");
        }

    function handleEmailChange(event) {
        setEmail(event.target.value);
        setEmailError("");
        }

    function handlePasswordBlur() {
        if (password.trim() === "") {
            setPasswordError("* 비밀번호를 입력해주세요.");
            return;
        }

        if (!PASSWORD_PATTERN.test(password.trim())) {
            setPasswordError(
            "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
            );
            return;
        }

        setPasswordError("");
        }

    function handlePasswordChange(event) {
        setPassword(event.target.value);
        setPasswordError("");
        }

    function handlePasswordCheckBlur() {
        if (passwordCheck.trim() === "") {
            setPasswordCheckError(
            "* 비밀번호를 한 번 더 입력해주세요."
            );
            return;
        }

        if (passwordCheck !== password) {
            setPasswordCheckError("* 비밀번호가 다릅니다.");
            return;
        }

        setPasswordCheckError("");
        }

    function handlePasswordCheckChange(event) {
        setPasswordCheck(event.target.value);
        setPasswordCheckError("");
        }

    function handleNicknameBlur() {
        if (nickname.trim() === "") {
            setNicknameError("* 닉네임을 입력해주세요.");
            return;
        }

        if (nickname.includes(" ")) {
            setNicknameError("* 띄어쓰기를 없애주세요.");
            return;
        }

        if (nickname.length > 10) {
            setNicknameError("* 닉네임은 최대 10자까지 작성 가능합니다.");
            return;
        }

        setNicknameError("");
    }

    function handleNicknameChange(event) {
        setNickname(event.target.value);
        setNicknameError("");
    }

    async function handleSubmit(event) {
        event.preventDefault();

        if (!isFormValid) {
            return;
        }

        const formData = new FormData();

        formData.append("email", email.trim());
        formData.append("password", password.trim());
        formData.append("nickname", nickname.trim());

        if (profileImage) {
            formData.append("profileImage", profileImage);
        }

        try {
            const response = await fetch(
            "/api/users/signup",
            {
                method: "POST",
                body: formData,
            }
            );

            if (!response.ok) {
            const message = await response.text();

            if (message.includes("중복된 이메일")) {
                setEmailError("* 중복된 이메일입니다.");
                return;
            }

            if (message.includes("중복된 닉네임")) {
                setNicknameError("* 중복된 닉네임입니다.");
                return;
            }

            alert(message);
            return;
            }

            alert("회원가입 성공!");
            navigate("/login");
        } catch {
            alert("서버와 연결할 수 없습니다.");
        }
        }


  return (
    <div className="signup-container">
        <div className="title">
            <button className="back-btn" type="button" onClick={handleBackClick}> {"<"} </button>
            <Link to="/posts" className="home-link">
                <h1>여행발자국</h1>
            </Link>
        </div>
        <hr className="main-hr" />
        <div className="content">
            <h2>회원가입</h2>
            <form className="detail-content" onSubmit={handleSubmit} noValidate>
                <div className="input-container">
                    <label>프로필 사진</label>
                    <div className="error-message">{profileImageError}</div>
                    <label
                        htmlFor="profile-image"
                        className="profile-image-upload"
                        style={previewUrl ? { backgroundImage: `url(${previewUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
                    >
                        {!previewUrl && <span className="profile-image-plus">+</span>}
                    </label>
                    <input type="file" id="profile-image" accept="image/*" onChange={handleProfileImageChange}/>
                </div>
                <div className="input-container">
                    <label htmlFor="email">이메일*</label>
                    <input
                        type="email"
                        id="email"
                        className="input"
                        placeholder="이메일을 입력하세요."
                        value={email}
                        onChange={handleEmailChange}
                        onBlur={handleEmailBlur}
                    />
                    <div className="error-message">{emailError}</div>
                </div>
                <div className="input-container">
                    <label htmlFor="password">비밀번호*</label>
                    <input
                        type="password"
                        id="password"
                        className="input"
                        placeholder="비밀번호를 입력하세요."
                        value={password}
                        onChange={handlePasswordChange}
                        onBlur={handlePasswordBlur}
                    />
                    <div className="error-message">{passwordError}</div>
                </div>
                <div className="input-container">
                    <label htmlFor="password-check">비밀번호 확인*</label>
                    <input
                        type="password"
                        id="password-check"
                        className="input"
                        placeholder="비밀번호를 한 번 더 입력하세요."
                        value={passwordCheck}
                        onChange={handlePasswordCheckChange}
                        onBlur={handlePasswordCheckBlur}
                    />
                    <div className="error-message">{passwordCheckError}</div>
                </div>
                <div className="input-container">
                    <label htmlFor="nickname">닉네임*</label>
                    <input
                        type="text"
                        id="nickname"
                        className="input"
                        placeholder="닉네임을 입력하세요."
                        value={nickname}
                        onChange={handleNicknameChange}
                        onBlur={handleNicknameBlur}
                    />
                    <div className="error-message">{nicknameError}</div>
                </div>
                <div>
                    <button
                        type="submit"
                        className={`signup-btn ${isFormValid ? "active" : ""}`}
                        disabled={!isFormValid}
                    >
                        회원가입
                    </button>
                </div>
                <div><Link to="/login" className="login-link">로그인하러 가기</Link></div>
            </form>
        </div>
    </div>
  );
}

export default SignupPage;
