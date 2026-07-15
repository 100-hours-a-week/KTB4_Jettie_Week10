const API_BASE_URL = "http://localhost:8080";

async function apiFetch(url, options = {}) {
    const token = localStorage.getItem("accessToken");

    const headers = {
        ...(options.headers || {})
    };

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${url}`, {
        ...options,
        headers
    });

    if (response.status === 401 || response.status === 403) {
        alert("로그인이 필요합니다.");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("isLogin");
        location.href = "login.html";
        return;
    }

    return response;
}