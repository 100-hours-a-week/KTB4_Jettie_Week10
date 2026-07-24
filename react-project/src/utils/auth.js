export function clearLoginStorage() {
  ["accessToken", "isLogin", "userId", "email", "nickname", "profileImage"].forEach(
    (key) => localStorage.removeItem(key),
  );
}
