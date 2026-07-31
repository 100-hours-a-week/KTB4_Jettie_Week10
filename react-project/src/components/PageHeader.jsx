import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";
import { toRelativeAssetUrl } from "../utils/url.js";

export function ProfileImage({ src, className = "" }) {
  if (!src || src === "null" || src === "undefined") return null;
  return (
    <img
      className={`profile-image ${className}`}
      src={toRelativeAssetUrl(src)}
      alt="프로필사진"
      style={{ display: "block" }}
    />
  );
}

export default function PageHeader({ backTo, onBack, requireLogin = true }) {
  const navigate = useNavigate();
  const { isLogin, profileImage, logout: clearAuth } = useAuth();

  function goBack() {
    if (onBack) {
      onBack();
      return;
    }

    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate(backTo, { replace: true });
  }

  function logout() {
    clearAuth();
    alert("로그아웃 되었습니다.");
    navigate("/login");
  }

  return (
    <>
      <header className="title">
        {backTo && (
          <button
            className="back-btn"
            type="button"
            onClick={goBack}
          >
            {"<"}
          </button>
        )}
        <Link to="/posts" className="home-link"><h1>여행발자국</h1></Link>
        {(!requireLogin || isLogin) && isLogin && (
          <div className="profile-menu">
            <button className="user-info-btn header-profile-circle" type="button">
              <ProfileImage
                src={profileImage}
                className="header-profile-image"
              />
            </button>
            <nav className="profile-dropdown">
              <Link className="profile-dropdown-menu" to="/users/me">회원정보수정</Link>
              <Link className="profile-dropdown-menu" to="/users/me/password">비밀번호 수정</Link>
              <Link className="profile-dropdown-menu" to="/users/me/posts">나의 기록</Link>
              <button className="profile-dropdown-menu logout-btn" type="button" onClick={logout}>
                로그아웃
              </button>
            </nav>
          </div>
        )}
      </header>
      <hr className="main-hr" />
    </>
  );
}
