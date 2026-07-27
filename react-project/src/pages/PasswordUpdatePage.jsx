import { useEffect, useState } from "react";
import { apiFetch } from "../api/api.js";
import PageHeader from "../components/PageHeader.jsx";
import "./PasswordUpdatePage.css";

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,20}$/;

function PasswordUpdatePage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordCheck, setPasswordCheck] = useState("");
  const [errors, setErrors] = useState({});
  const [complete, setComplete] = useState(false);
  const valid = Boolean(
    currentPassword &&
    PASSWORD_PATTERN.test(password) &&
    password === passwordCheck
  );

  useEffect(() => () => window.clearTimeout(), []);

  function validate(name) {
    if (name === "currentPassword") {
      setErrors((value) => ({ ...value, currentPassword: currentPassword ? "" : "* 현재 비밀번호를 입력해주세요." }));
    }
    if (name === "password") {
      setErrors((value) => ({ ...value, password: !password ? "* 비밀번호를 입력해주세요." : !PASSWORD_PATTERN.test(password) ? "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다." : "" }));
    }
    if (name === "passwordCheck") {
      setErrors((value) => ({ ...value, passwordCheck: !passwordCheck ? "* 비밀번호를 한 번 더 입력해주세요." : password !== passwordCheck ? "* 비밀번호가 다릅니다." : "" }));
    }
  }

  function validateAll() {
    const nextErrors = {
      currentPassword: currentPassword ? "" : "* 현재 비밀번호를 입력해주세요.",
      password: !password
        ? "* 새 비밀번호를 입력해주세요."
        : !PASSWORD_PATTERN.test(password)
          ? "* 비밀번호는 8자 이상, 20자 이하이며, 대문자, 소문자, 숫자, 특수문자를 각각 최소 1개 포함해야 합니다."
          : "",
      passwordCheck: !passwordCheck
        ? "* 비밀번호를 한 번 더 입력해주세요."
        : password !== passwordCheck
          ? "* 비밀번호가 다릅니다."
          : "",
    };
    setErrors(nextErrors);
    return !Object.values(nextErrors).some(Boolean);
  }

  async function submit(event) {
    event.preventDefault();
    if (!validateAll()) return;
    try {
      const response = await apiFetch("/users/me/password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, password, passwordCheck }),
      });
      if (!response.ok) {
        let message = "비밀번호 수정에 실패했습니다.";
        try {
          const errorResponse = await response.json();
          message = errorResponse.message ?? message;
        } catch {
          // JSON 오류 응답이 아니면 기본 메시지를 사용한다.
        }
        if (message.includes("현재 비밀번호")) {
          setErrors((value) => ({ ...value, currentPassword: `* ${message}` }));
        } else if (message.includes("확인") || message.includes("일치")) {
          setErrors((value) => ({ ...value, passwordCheck: `* ${message}` }));
        } else {
          setErrors((value) => ({ ...value, password: `* ${message}` }));
        }
        return;
      }
      setCurrentPassword(""); setPassword(""); setPasswordCheck("");
      setErrors({});
      setComplete(true); window.setTimeout(() => setComplete(false), 2000);
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  return (
    <div className="password-update-container">
      <PageHeader />
      <div className="content-wrap"><h2>비밀번호 수정</h2>
        <form className="detail-content" onSubmit={submit}>
          <div className="input-container">
            <label htmlFor="current-password">현재 비밀번호*</label>
            <input type="password" id="current-password" className="input" value={currentPassword} placeholder="현재 비밀번호를 입력하세요." onChange={(e) => { setCurrentPassword(e.target.value); setErrors({ ...errors, currentPassword: "" }); }} onBlur={() => validate("currentPassword")} />
            <div className="error-message">{errors.currentPassword}</div>
          </div>
          <div className="input-container">
            <label htmlFor="new-password">새 비밀번호*</label>
            <input type="password" id="new-password" className="input" value={password} placeholder="새 비밀번호를 입력하세요." onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: "" }); }} onBlur={() => validate("password")} />
            <div className="error-message">{errors.password}</div>
          </div>
          <div className="input-container">
            <label htmlFor="new-password-check">새 비밀번호 확인*</label>
            <input type="password" id="new-password-check" className="input" value={passwordCheck} placeholder="새 비밀번호를 한 번 더 입력하세요." onChange={(e) => { setPasswordCheck(e.target.value); setErrors({ ...errors, passwordCheck: "" }); }} onBlur={() => validate("passwordCheck")} />
            <div className="error-message">{errors.passwordCheck}</div>
          </div>
          <button
            className={`password-update-btn ${valid ? "active" : ""}`}
            disabled={!valid}
          >
            수정하기
          </button>
          <div className={`password-update-complete ${complete ? "active" : ""}`}>수정완료</div>
        </form>
      </div>
    </div>
  );
}

export default PasswordUpdatePage;
