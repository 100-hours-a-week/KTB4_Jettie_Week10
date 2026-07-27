import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import AuthStateContext from "./auth-state-context.js";
import {
  AUTH_CHANGED_EVENT,
  clearLoginStorage,
  readLoginStorage,
  saveLoginStorage,
  updateLoginStorage,
} from "../utils/auth.js";

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(readLoginStorage);

  const refreshAuth = useCallback(() => {
    setAuth(readLoginStorage());
  }, []);

  useEffect(() => {
    window.addEventListener(AUTH_CHANGED_EVENT, refreshAuth);
    window.addEventListener("storage", refreshAuth);

    return () => {
      window.removeEventListener(AUTH_CHANGED_EVENT, refreshAuth);
      window.removeEventListener("storage", refreshAuth);
    };
  }, [refreshAuth]);

  const login = useCallback((loginData) => {
    saveLoginStorage(loginData);
  }, []);

  const logout = useCallback(() => {
    clearLoginStorage();
  }, []);

  const updateAuth = useCallback((userData) => {
    updateLoginStorage(userData);
  }, []);

  const previewProfileImage = useCallback((profileImage) => {
    setAuth((currentAuth) => ({
      ...currentAuth,
      profileImage,
    }));
  }, []);

  const value = useMemo(
    () => ({
      ...auth,
      authenticated: auth.isLogin && Boolean(auth.accessToken),
      login,
      logout,
      updateAuth,
      previewProfileImage,
      refreshAuth,
    }),
    [
      auth,
      login,
      logout,
      previewProfileImage,
      refreshAuth,
      updateAuth,
    ],
  );

  return (
    <AuthStateContext.Provider value={value}>
      {children}
    </AuthStateContext.Provider>
  );
}
