import { clearLoginStorage } from "../utils/auth.js";

const API_BASE_URL = "/api";
// const API_BASE_URL = "http://localhost:8080";

export async function apiFetch(url, options = {}) {
    const requestUrl = url.startsWith("/uploads/")
        ? url
        : `${API_BASE_URL}${url}`;

    const accessToken =
        localStorage.getItem("accessToken");

    const headers = new Headers(
        options.headers || {}
    );

    const isFormData =
        options.body instanceof FormData;

    if (
        !isFormData &&
        options.body &&
        !headers.has("Content-Type")
    ) {
        headers.set(
            "Content-Type",
            "application/json"
        );
    }

    if (
        accessToken &&
        accessToken !== "null" &&
        accessToken !== "undefined"
    ) {
        headers.set(
            "Authorization",
            `Bearer ${accessToken}`
        );
    }

    const response = await fetch(
        requestUrl,
        {
            ...options,
            headers,
        }
    );

    if (response.status === 401) {
        clearLoginStorage();

        alert("로그인이 필요합니다.");

        /*
         * React Router에 등록된 로그인 경로로 이동
         */
        window.location.href = "/login";

        const error =
            new Error("Unauthorized");

        error.status = 401;

        throw error;
    }

    if (response.status === 403) {
        const errorData = await response.json();

        const error = new Error(
            errorData.message || "접근 권한이 없습니다."
        );

        error.status = 403;

        throw error;
    }

    return response;
}
