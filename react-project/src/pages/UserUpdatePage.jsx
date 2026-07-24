import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import PageHeader, { ProfileImage } from "../components/PageHeader.jsx";
import { clearLoginStorage } from "../utils/auth.js";
import "./UserUpdatePage.css";

function UserUpdatePage() {
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const [email, setEmail] = useState("");
  const [nickname, setNickname] = useState("");
  const [originalNickname, setOriginalNickname] = useState("");
  const [profile, setProfile] = useState("");
  const [profileFile, setProfileFile] = useState(null);
  const [error, setError] = useState("");
  const [complete, setComplete] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const previewUrlRef = useRef("");

  useEffect(() => {
    apiFetch(`/users/${userId}`).then(async (response) => {
      if (!response.ok) throw new Error();
      const user = await response.json();
      setEmail(user.email); setNickname(user.nickname); setOriginalNickname(user.nickname);
      setProfile(user.profileImage || "");
      localStorage.setItem("profileImage", user.profileImage || "");
    }).catch(() => alert("회원 정보를 불러오지 못했습니다."));
  }, [userId]);

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
  }, []);

  function chooseImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("이미지 파일만 선택할 수 있습니다."); event.target.value = ""; return;
    }
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const previewUrl = URL.createObjectURL(file);
    previewUrlRef.current = previewUrl;
    setProfileFile(file);
    setProfile(previewUrl);
  }

  const trimmed = nickname.trim();
  const valid = Boolean(
    trimmed &&
    trimmed.length <= 10 &&
    (trimmed !== originalNickname || profileFile)
  );

  async function update() {
    if (!trimmed) return setError("* 닉네임을 입력해주세요.");
    if (trimmed.length > 10) return setError("* 닉네임은 최대 10자까지 작성 가능합니다.");
    const formData = new FormData();
    formData.append("nickname", trimmed);
    if (profileFile) formData.append("profileImage", profileFile);
    try {
      const response = await apiFetch(`/users/${userId}`, { method: "PATCH", body: formData });
      if (!response.ok) {
        const message = await response.text();
        if (message.includes("중복된 닉네임")) return setError("* 중복된 닉네임입니다.");
        return alert(message);
      }
      const user = await response.json();
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = "";
      }
      setNickname(user.nickname); setOriginalNickname(user.nickname); setProfile(user.profileImage || "");
      setProfileFile(null); localStorage.setItem("nickname", user.nickname);
      localStorage.setItem("profileImage", user.profileImage || "");
      setComplete(true); window.setTimeout(() => setComplete(false), 2000);
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  async function deleteUser() {
    try {
      const response = await apiFetch(`/users/${userId}`, { method: "DELETE" });
      if (!response.ok) return alert("회원 탈퇴에 실패했습니다.");
      clearLoginStorage(); alert("회원 탈퇴가 완료되었습니다."); navigate("/login");
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  return (
    <div className="user-update-container">
      <PageHeader />
      <div className="content-wrap"><h2>회원정보수정</h2>
        <div className="content">
          <div className="input-container">
            <label htmlFor="profile-image">프로필 사진*</label>
            <label htmlFor="profile-image" className="profile-image-upload">
              <ProfileImage src={profile} className="user-profile-preview" />
              {!profile && <span className="profile-image-text">변경</span>}
            </label>
            <input type="file" id="profile-image" accept="image/*" onChange={chooseImage} />
          </div>
          <div className="input-container"><label>이메일*</label><div id="email">{email}</div></div>
          <div className="input-container">
            <label htmlFor="nickname">닉네임*</label>
            <input id="nickname" className="input" value={nickname} onChange={(e) => { setNickname(e.target.value); setError(""); }} />
          </div>
          <div className="error-message">{error}</div>
          <button
            className={`user-update-btn ${valid ? "active" : ""}`}
            type="button"
            onClick={update}
            disabled={!valid}
          >
            수정하기
          </button>
          <button className="user-delete-btn" type="button" onClick={() => setDeleteOpen(true)}>회원 탈퇴</button>
          <div className={`user-update-complete ${complete ? "active" : ""}`}>수정완료</div>
        </div>
      </div>
      <div className={`modal-overlay user-delete-modal-overlay ${deleteOpen ? "active" : ""}`}>
        <div className="user-delete-modal">
          <p className="modal-title">회원탈퇴 하시겠습니까?</p>
          <p className="modal-content">작성된 게시글과 댓글은 삭제됩니다.</p>
          <div className="modal-btn-wrap">
            <button className="user-delete-cancel-btn" onClick={() => setDeleteOpen(false)}>취소</button>
            <button className="user-delete-confirm-btn" onClick={deleteUser}>확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserUpdatePage;
