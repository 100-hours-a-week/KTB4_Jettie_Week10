export const AUTH_CHANGED_EVENT = "auth-changed";

const AUTH_STORAGE_KEYS = [
  "accessToken",
  "isLogin",
  "userId",
  "email",
  "nickname",
  "profileImage",
];

function notifyAuthChanged() {
  window.dispatchEvent(new Event(AUTH_CHANGED_EVENT));
}

export function readLoginStorage() {
  const accessToken = localStorage.getItem("accessToken") || "";
  const storedUserId = localStorage.getItem("userId");

  return {
    accessToken,
    isLogin: localStorage.getItem("isLogin") === "true",
    userId: storedUserId ? Number(storedUserId) : null,
    email: localStorage.getItem("email") || "",
    nickname: localStorage.getItem("nickname") || "",
    profileImage: localStorage.getItem("profileImage") || "",
  };
}

export function saveLoginStorage(loginData) {
  localStorage.setItem("accessToken", loginData.accessToken || "");
  localStorage.setItem("isLogin", "true");
  localStorage.setItem("userId", String(loginData.userId ?? ""));
  localStorage.setItem("email", loginData.email ?? "");
  localStorage.setItem("nickname", loginData.nickname ?? "");
  localStorage.setItem("profileImage", loginData.profileImage ?? "");
  notifyAuthChanged();
}

export function updateLoginStorage(userData) {
  if (userData.email !== undefined) {
    localStorage.setItem("email", userData.email ?? "");
  }
  if (userData.nickname !== undefined) {
    localStorage.setItem("nickname", userData.nickname ?? "");
  }
  if (userData.profileImage !== undefined) {
    localStorage.setItem("profileImage", userData.profileImage ?? "");
  }
  notifyAuthChanged();
}

export function clearLoginStorage() {
  AUTH_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
  notifyAuthChanged();
}
