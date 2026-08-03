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

    /*
     * FormData를 보낼 때는 Content-Type을 직접 설정하지 않는다.
     * 브라우저가 boundary를 포함해 자동으로 설정한다.
     */
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
        alert("접근 권한이 없습니다.");

        const error =
            new Error("Forbidden");

        error.status = 403;

        throw error;
    }

    return response;
}
