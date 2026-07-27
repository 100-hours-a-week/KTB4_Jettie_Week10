import { useContext } from "react";
import AuthStateContext from "../context/auth-state-context.js";

export default function useAuth() {
  const context = useContext(AuthStateContext);

  if (!context) {
    throw new Error("useAuth는 AuthProvider 안에서 사용해야 합니다.");
  }

  return context;
}
