import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

function ProtectedRoute() {
  const { authenticated } = useAuth();

  useEffect(() => {
    if (!authenticated) {
      alert("로그인이 필요합니다.");
    }
  }, [authenticated]);

  if (!authenticated) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export default ProtectedRoute;
