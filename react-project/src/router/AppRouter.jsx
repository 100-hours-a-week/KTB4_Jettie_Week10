import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import LoginPage from "../pages/LoginPage.jsx";
import PostsPage from "../pages/PostsPage.jsx";
import SignupPage from "../pages/SignupPage.jsx";
import PostCreatePage from "../pages/PostCreatePage.jsx";
import PostPage from "../pages/PostPage.jsx";
import PostUpdatePage from "../pages/PostUpdatePage.jsx";
import MyPostPage from "../pages/MyPostPage.jsx";
import UserUpdatePage from "../pages/UserUpdatePage.jsx";
import PasswordUpdatePage from "../pages/PasswordUpdatePage.jsx";

function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/posts" element={<PostsPage />} />
        <Route path="/posts/create" element={<PostCreatePage />} />
        <Route path="/posts/:postId" element={<PostPage />} />
        <Route path="/posts/:postId/edit" element={<PostUpdatePage />} />
        <Route path="/users/me/posts" element={<MyPostPage />} />
        <Route path="/users/me" element={<UserUpdatePage />} />
        <Route path="/users/me/password" element={<PasswordUpdatePage />} />
        <Route path="/users/update" element={<Navigate to="/users/me" replace />} />
        <Route path="/users/password" element={<Navigate to="/users/me/password" replace />} />
        <Route path="/my-posts" element={<Navigate to="/users/me/posts" replace />} />
        <Route path="*" element={<Navigate to="/posts" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;
