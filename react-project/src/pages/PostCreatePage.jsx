import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api";
import PageHeader from "../components/PageHeader.jsx";
import useAuth from "../hooks/useAuth.js";
import "./PostCreatePage.css";

const AREA_LIST = [
    { value: "SEOUL", label: "서울" },
    { value: "GYEONGGI", label: "경기" },
    { value: "INCHEON", label: "인천" },
    { value: "GANGWON", label: "강원" },
    { value: "DAEJEON", label: "대전" },
    { value: "SEJONG", label: "세종" },
    { value: "CHUNGBUK", label: "충북" },
    { value: "CHUNGNAM", label: "충남" },
    { value: "DAEGU", label: "대구" },
    { value: "GYEONGBUK", label: "경북" },
    { value: "BUSAN", label: "부산" },
    { value: "ULSAN", label: "울산" },
    { value: "GYEONGNAM", label: "경남" },
    { value: "GWANGJU", label: "광주" },
    { value: "JEONBUK", label: "전북" },
    { value: "JEONNAM", label: "전남" },
    { value: "JEJU", label: "제주" },
];

function PostCreatePage() {
    const navigate = useNavigate();
    const { authenticated } = useAuth();

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [postImages, setPostImages] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);
    const [postCreateError, setPostCreateError] = useState("");
    const [formErrors, setFormErrors] = useState({
        title: "",
        content: "",
        area: "",
        postImages: "",
    });
    const [area, setArea] = useState("");
    const [hashtagInput, setHashtagInput] = useState("");
    const [hashtags, setHashtags] = useState([]);
    const [hashtagError, setHashtagError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const MIN_IMAGE_COUNT = 1;
    const MAX_IMAGE_COUNT = 10;

    /*
     * 컴포넌트가 사라질 때 미리보기 URL의 메모리를 해제한다.
     */
    useEffect(() => {
        return function cleanupPreviewUrls() {
            previewUrls.forEach(function (url) {
                URL.revokeObjectURL(url);
            });
        };
    }, [previewUrls]);

    function handleTitleChange(event) {
        const value = event.target.value;

        setTitle(value.slice(0, 26));
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            title: "",
        }));
        setPostCreateError("");
    }

    function handleContentChange(event) {
        const value = event.target.value;

        setContent(value);
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            content: "",
        }));
        setPostCreateError("");
    }

    function handleAreaChange(event) {
        setArea(event.target.value);
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            area: "",
        }));
        setPostCreateError("");
    }

    function addHashtag() {
        const tag = hashtagInput.trim();

        if (tag === "") {
            return;
        }

        if (/\s/.test(tag)) {
            setHashtagError(
                "해시태그에는 공백을 포함할 수 없습니다."
            );
            return;
        }

        if (tag.includes("#")) {
            setHashtagError(
                "해시태그에는 #을 포함하지 마세요."
            );
            return;
        }

        if (tag.length > 20) {
            setHashtagError(
                "해시태그는 20자 이하로 입력해주세요."
            );
            return;
        }

        if (hashtags.includes(tag)) {
            setHashtagError(
                "이미 추가된 해시태그입니다."
            );
            return;
        }

        if (hashtags.length >= 5) {
            setHashtagError(
                "해시태그는 최대 5개까지 입력할 수 있습니다."
            );
            return;
        }

        setHashtags((currentHashtags) => [
            ...currentHashtags,
            tag,
        ]);
        setHashtagInput("");
        setHashtagError("");
    }

    function handleHashtagKeyDown(event) {
        if (
            event.key !== "Enter" &&
            event.key !== " "
        ) {
            return;
        }

        if (event.nativeEvent.isComposing) {
            return;
        }

        event.preventDefault();
        addHashtag();
    }

    function removeHashtag(tagToRemove) {
        setHashtags((currentHashtags) =>
            currentHashtags.filter(
                (tag) => tag !== tagToRemove
            )
        );
        setHashtagError("");
    }

    function handleImageChange(event) {
        const files = Array.from(event.target.files);

        /*
         * 기존 미리보기 URL 메모리 해제
         */
        previewUrls.forEach(function (url) {
            URL.revokeObjectURL(url);
        });

        setPreviewUrls([]);
        setPostImages([]);

        if (files.length === 0) {
            setFormErrors((currentErrors) => ({
                ...currentErrors,
                postImages: "사진을 최소 한 장 선택해주세요.",
            }));
            return;
        }

        if (files.length > MAX_IMAGE_COUNT) {
            alert(
                `사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`
            );

            event.target.value = "";

            setPostCreateError(
                `* 사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`
            );
            return;
        }

        const invalidFile = files.find(function (file) {
            return !file.type.startsWith("image/");
        });

        if (invalidFile) {
            alert("이미지 파일만 선택할 수 있습니다.");

            event.target.value = "";

            setPostCreateError(
                "* 이미지 파일만 선택해주세요."
            );
            return;
        }

        /*
         * 선택한 원본 파일들을 state에 저장한다.
         */
        setPostImages(files);

        /*
         * 이미지 미리보기용 임시 URL을 만든다.
         */
        const newPreviewUrls = files.map(function (file) {
            return URL.createObjectURL(file);
        });

        setPreviewUrls(newPreviewUrls);
        setFormErrors((currentErrors) => ({
            ...currentErrors,
            postImages: "",
        }));
        setPostCreateError("");
    }

    const isTitleValid = title.trim() !== "";
    const isContentValid = content.trim() !== "";
    const isAreaValid = area !== "";

    const isImageCountValid =
        postImages.length >= MIN_IMAGE_COUNT &&
        postImages.length <= MAX_IMAGE_COUNT;

    const areAllFilesImages = postImages.every(function (file) {
        return file.type.startsWith("image/");
    });

    const isImageValid =
        isImageCountValid &&
        areAllFilesImages;

    const isFormValid =
        isTitleValid &&
        isContentValid &&
        isAreaValid &&
        isImageValid;

    async function handlePostCreate(event) {
        event.preventDefault();

        /*
         * 1. 서버에 요청하기 전에 로그인 여부를 먼저 검사한다.
         *
         * accessToken이 없으면 POST /posts 요청을 보내지 않고
         * 로그인 페이지로 이동한다.
         */
        if (!authenticated) {
            alert("로그인이 필요합니다.");

            navigate("/login", {
                replace: true,
                state: {
                    from: "/posts/create",
                },
            });

            /*
             * return이 있어야 아래 게시글 작성 코드가 실행되지 않는다.
             */
            return;
        }

        const nextFormErrors = {
            title: title.trim() === ""
                ? "제목을 입력해주세요."
                : "",
            content: content.trim() === ""
                ? "내용을 입력해주세요."
                : "",
            area: area === ""
                ? "지역을 선택해주세요."
                : "",
            postImages: postImages.length < MIN_IMAGE_COUNT
                ? "사진을 최소 한 장 선택해주세요."
                : "",
        };

        setFormErrors(nextFormErrors);

        if (Object.values(nextFormErrors).some(Boolean)) {
            setPostCreateError("");
            return;
        }

        /*
         * 5. 최대 이미지 개수 검사
         */
        if (postImages.length > MAX_IMAGE_COUNT) {
            setPostCreateError(
                `* 사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`
            );
            return;
        }

        /*
         * 6. 이미지 파일 형식 검사
         */
        const invalidFile = postImages.find(
            function (file) {
                return !file.type.startsWith("image/");
            }
        );

        if (invalidFile) {
            setPostCreateError(
                "* 이미지 파일만 선택해주세요."
            );
            return;
        }

        setPostCreateError("");
        setIsSubmitting(true);

        const formData = new FormData();

        formData.append(
            "title",
            title.trim()
        );

        formData.append(
            "content",
            content.trim()
        );

        formData.append(
            "area",
            area
        );

        postImages.forEach(function (file) {
            formData.append(
                "postImages",
                file
            );
        });

        hashtags.forEach(function (tag) {
            formData.append(
                "hashtags",
                tag
            );
        });

        try {
            const response = await apiFetch("/posts", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorText =
                    await response.text();

                console.error(
                    "게시글 작성 실패 상태 코드:",
                    response.status
                );

                console.error(
                    "게시글 작성 실패 응답:",
                    errorText
                );

                /*
                 * 401은 apiFetch에서 이미 로그인 안내와
                 * 로그인 페이지 이동을 처리할 수 있으므로
                 * 일반 게시글 작성 실패 alert를 띄우지 않는다.
                 */
                if (response.status === 401) {
                    return;
                }

                alert(
                    `게시글 작성 실패: ${response.status}`
                );

                return;
            }

            navigate("/posts");
        } catch (error) {
            console.error(
                "게시글 작성 중 발생한 오류:",
                error
            );

            /*
             * apiFetch가 401 오류에 status 값을 담아
             * throw한 경우 일반 오류 alert를 띄우지 않는다.
             */
            if (
                error?.status === 401 ||
                error?.response?.status === 401 ||
                error?.message === "Unauthorized"
            ) {
                return;
            }

            /*
             * apiFetch가 401 처리 과정에서 토큰을 삭제한 경우에도
             * 일반 오류 메시지를 추가로 띄우지 않는다.
             */
            alert(
                "게시글을 작성하는 중 오류가 발생했습니다."
            );
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="post-create-container">
            <PageHeader backTo="/posts" />

            <div className="content-wrap">
                <h2>여행 기록하기</h2>

                <form
                    className="content"
                    onSubmit={handlePostCreate}
                >
                    <div>
                        <label htmlFor="title">
                            제목*
                        </label>
                    </div>

                    <hr />

                    <div>
                        <input
                            id="title"
                            type="text"
                            value={title}
                            onChange={handleTitleChange}
                            placeholder="제목을 입력해주세요. (최대 26글자)"
                        />
                        {formErrors.title && (
                            <span className="field-error">
                                {formErrors.title}
                            </span>
                        )}
                    </div>

                    <hr />

                    <div>
                        <label htmlFor="content">
                            내용*
                        </label>
                    </div>

                    <hr />

                    <div>
                        <textarea
                            id="content"
                            value={content}
                            onChange={handleContentChange}
                            placeholder="내용을 입력해주세요."
                        />
                        {formErrors.content && (
                            <span className="field-error">
                                {formErrors.content}
                            </span>
                        )}
                    </div>

                    <hr />

                    <div>
                        <label className="area-select-label">
                            지역*
                        </label>

                        <div className="area-select">
                            {AREA_LIST.map(
                                function (areaItem) {
                                    return (
                                        <label
                                            className="area-option"
                                            key={areaItem.value}
                                        >
                                            <input
                                                type="radio"
                                                name="area"
                                                value={areaItem.value}
                                                checked={
                                                    area ===
                                                    areaItem.value
                                                }
                                                onChange={
                                                    handleAreaChange
                                                }
                                            />

                                            <span>
                                                #{areaItem.label}
                                            </span>
                                        </label>
                                    );
                                }
                            )}
                        </div>
                        {formErrors.area && (
                            <span className="field-error">
                                {formErrors.area}
                            </span>
                        )}
                    </div>

                    <hr />

                    <div className="hashtag-input-wrap">
                        <div className="hashtag-label-row">
                            <label htmlFor="hashtag-input">
                                해시태그
                            </label>
                            <span>{hashtags.length}/5</span>
                        </div>

                        <input
                            id="hashtag-input"
                            className="hashtag-input"
                            type="text"
                            value={hashtagInput}
                            onChange={(event) => {
                                setHashtagInput(event.target.value);
                                setHashtagError("");
                            }}
                            onKeyDown={handleHashtagKeyDown}
                            placeholder="Enter 또는 Space를 눌러 해시태그를 추가하세요!"
                        />

                        {hashtagError && (
                            <span className="hashtag-error">
                                {hashtagError}
                            </span>
                        )}

                        {hashtags.length > 0 && (
                            <div className="hashtag-list">
                                {hashtags.map((tag) => (
                                    <span className="hashtag-chip" key={tag}>
                                        #{tag}
                                        <button
                                            type="button"
                                            onClick={() => removeHashtag(tag)}
                                            aria-label={`${tag} 해시태그 삭제`}
                                        >
                                            ×
                                        </button>
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    <hr />

                    <div className="post-image-wrap">
                        <label htmlFor="post-image">
                            이미지
                        </label>

                        <input
                            type="file"
                            id="post-image"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                        />
                        {formErrors.postImages && (
                            <span className="field-error">
                                {formErrors.postImages}
                            </span>
                        )}
                    </div>

                    <div
                        id="post-image-preview-list"
                        className="post-image-preview-list"
                    >
                        {previewUrls.map(
                            function (url, index) {
                                return (
                                    <div
                                        className="preview-item"
                                        key={url}
                                    >
                                        <img
                                            src={url}
                                            className="preview-image"
                                            alt={`선택한 여행 사진 ${
                                                index + 1
                                            }`}
                                        />

                                        {index === 0 && (
                                            <span className="representative-badge">
                                                대표
                                            </span>
                                        )}
                                    </div>
                                );
                            }
                        )}
                    </div>

                    <span
                        className="error-message"
                        id="post-create-error"
                    >
                        {postCreateError}
                    </span>

                    <button
                        type="submit"
                        className={`post-create-btn ${
                            isFormValid ? "active" : ""
                        }`}
                        disabled={isSubmitting}
                    >
                        {isSubmitting
                            ? "작성 중..."
                            : "완료"}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default PostCreatePage;
