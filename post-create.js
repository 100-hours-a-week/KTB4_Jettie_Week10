const backBtn = document.querySelector(".back-btn");

const titleInput = document.querySelector("#title");
const contentInput = document.querySelector("#content");

const postImageInput = document.querySelector("#post-image");
const postImagePreviewList = document.querySelector("#post-image-preview-list");

const postCreateBtn = document.querySelector(".post-create-btn");
const postCreateError = document.querySelector("#post-create-error");

const areaInputs = document.querySelectorAll('input[name="area"]');

const headerProfileImage = document.querySelector(".header-profile-image");

const isLogin = localStorage.getItem("isLogin");
const loginUserProfileImage = localStorage.getItem("profileImage");

const MIN_IMAGE_COUNT = 1;
const MAX_IMAGE_COUNT = 10;

let previewObjectUrls = [];

setProfileImage(headerProfileImage, loginUserProfileImage);

if (isLogin !== "true") {
    alert("로그인이 필요합니다.");
    location.href = "login.html";
}

backBtn.addEventListener("click", function () {
    location.href = "posts.html";
});

titleInput.addEventListener("input", function () {
    if (titleInput.value.length > 26) {
        titleInput.value =
            titleInput.value.slice(0, 26);
    }

    postCreateError.textContent = "";
    checkPostCreateForm();
});

contentInput.addEventListener("input", function () {
    postCreateError.textContent = "";
    checkPostCreateForm();
});

areaInputs.forEach(function (areaInput) {
    areaInput.addEventListener("change", function () {
        postCreateError.textContent = "";
        checkPostCreateForm();
    });
});

postImageInput.addEventListener("change", function () {
    const files = Array.from(postImageInput.files);

    clearImagePreview();

    if (files.length === 0) {
        postCreateError.textContent =
            "* 여행 사진을 최소 한 장 선택해주세요.";

        checkPostCreateForm();
        return;
    }

    if (files.length > MAX_IMAGE_COUNT) {
        alert(
            `사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`
        );

        postImageInput.value = "";

        postCreateError.textContent =
            `* 사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`;

        checkPostCreateForm();
        return;
    }

    const invalidFile = files.find(function (file) {
        return !file.type.startsWith("image/");
    });

    if (invalidFile) {
        alert("이미지 파일만 선택할 수 있습니다.");

        postImageInput.value = "";

        postCreateError.textContent =
            "* 이미지 파일만 선택해주세요.";

        checkPostCreateForm();
        return;
    }

    postCreateError.textContent = "";

    files.forEach(function (file, index) {
        const previewItem =
            document.createElement("div");

        previewItem.className = "preview-item";

        const previewImage =
            document.createElement("img");

        const objectUrl =
            URL.createObjectURL(file);

        previewObjectUrls.push(objectUrl);

        previewImage.src = objectUrl;
        previewImage.className = "preview-image";
        previewImage.alt =
            `선택한 여행 사진 ${index + 1}`;

        previewItem.appendChild(previewImage);

        if (index === 0) {
            const representativeBadge =
                document.createElement("span");

            representativeBadge.className =
                "representative-badge";

            representativeBadge.textContent =
                "대표";

            previewItem.appendChild(
                representativeBadge
            );
        }

        postImagePreviewList.appendChild(
            previewItem
        );
    });

    checkPostCreateForm();
});

function checkPostCreateForm() {
    const isTitleValid =
        titleInput.value.trim() !== "";

    const isContentValid =
        contentInput.value.trim() !== "";

    const selectedArea =
        document.querySelector(
            'input[name="area"]:checked'
        );

    const isAreaValid =
        selectedArea !== null;

    const selectedFiles =
        Array.from(postImageInput.files);

    const isImageCountValid =
        selectedFiles.length >= MIN_IMAGE_COUNT &&
        selectedFiles.length <= MAX_IMAGE_COUNT;

    const areAllFilesImages =
        selectedFiles.every(function (file) {
            return file.type.startsWith("image/");
        });

    const isImageValid =
        isImageCountValid &&
        areAllFilesImages;

    if (
        isTitleValid &&
        isContentValid &&
        isAreaValid &&
        isImageValid
    ) {
        postCreateBtn.classList.add("active");
    } else {
        postCreateBtn.classList.remove("active");
    }
}

postCreateBtn.addEventListener(
    "click",
    async function () {
        const title =
            titleInput.value.trim();

        const content =
            contentInput.value.trim();

        const selectedArea =
            document.querySelector(
                'input[name="area"]:checked'
            );

        const selectedFiles =
            Array.from(postImageInput.files);

        if (title === "" || content === "") {
            postCreateError.textContent =
                "* 제목, 내용을 모두 작성해주세요.";

            return;
        }

        if (!selectedArea) {
            postCreateError.textContent =
                "* 지역을 선택해주세요.";

            return;
        }

        if (selectedFiles.length < MIN_IMAGE_COUNT) {
            postCreateError.textContent =
                "* 사진을 최소 한 장 선택해주세요.";

            return;
        }

        if (selectedFiles.length > MAX_IMAGE_COUNT) {
            postCreateError.textContent =
                `* 사진은 최대 ${MAX_IMAGE_COUNT}장까지 선택할 수 있습니다.`;

            return;
        }

        const invalidFile =
            selectedFiles.find(function (file) {
                return !file.type.startsWith("image/");
            });

        if (invalidFile) {
            postCreateError.textContent =
                "* 이미지 파일만 선택해주세요.";

            return;
        }

        postCreateError.textContent = "";

        postCreateBtn.disabled = true;

        const formData = new FormData();

        formData.append(
            "title",
            title
        );

        formData.append(
            "content",
            content
        );

        formData.append(
            "userId",
            Number(
                localStorage.getItem("userId")
            )
        );

        formData.append(
            "area",
            selectedArea.value
        );

        selectedFiles.forEach(function (file) {
            formData.append(
                "postImages",
                file
            );
        });

        console.log(
            "title:",
            formData.get("title")
        );

        console.log(
            "content:",
            formData.get("content")
        );

        console.log(
            "userId:",
            formData.get("userId")
        );

        console.log(
            "area:",
            formData.get("area")
        );

        console.log(
            "선택한 이미지 수:",
            selectedFiles.length
        );

        console.log(
            "대표 이미지:",
            selectedFiles[0]
        );

        try {
            const response =
                await apiFetch("/posts", {
                    method: "POST",
                    body: formData
                });

            if (!response.ok) {
                const errorText =
                    await response.text();

                console.error(
                    "게시글 작성 실패 상태:",
                    response.status
                );

                console.error(
                    "게시글 작성 실패 응답:",
                    errorText
                );

                alert(
                    `게시글 작성 실패: ${response.status}`
                );

                postCreateBtn.disabled = false;
                return;
            }

            location.href = "posts.html";

        } catch (error) {
            console.error(
                "게시글 작성 또는 응답 처리 오류:",
                error
            );

            alert(
                "게시글을 작성하는 중 오류가 발생했습니다."
            );

            postCreateBtn.disabled = false;
        }
    }
);

function clearImagePreview() {
    previewObjectUrls.forEach(function (objectUrl) {
        URL.revokeObjectURL(objectUrl);
    });

    previewObjectUrls = [];

    postImagePreviewList.innerHTML = "";
}

function setProfileImage(
    imgElement,
    profileImage
) {
    if (!imgElement) {
        return;
    }

    if (
        profileImage &&
        profileImage !== "null" &&
        profileImage !== "undefined"
    ) {
        imgElement.src = profileImage;
        imgElement.style.display = "block";
    } else {
        imgElement.removeAttribute("src");
        imgElement.style.display = "none";
    }
}

checkPostCreateForm();