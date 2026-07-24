import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import "./PostsPage.css";

const PAGE_SIZE = 10;

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

const AREA_LABELS = Object.fromEntries(
  AREA_LIST.map((area) => [area.value, area.label]),
);

function formatCount(count) {
  if (count >= 1000) {
    return `${Math.floor(count / 1000)}k`;
  }

  return count ?? 0;
}

function getAreaLabel(area) {
  return AREA_LABELS[area] ?? "지역 없음";
}

function isValidImagePath(imagePath) {
  return (
    imagePath &&
    imagePath !== "null" &&
    imagePath !== "undefined"
  );
}

function getThumbnailPath(post) {
  const imageCandidate =
    post.representativeImage ??
    post.postImage ??
    post.thumbnailImage ??
    post.thumbnailUrl ??
    post.postImages?.[0] ??
    post.imageUrls?.[0];

  if (typeof imageCandidate === "string") {
    return imageCandidate;
  }

  return (
    imageCandidate?.imageUrl ??
    imageCandidate?.url ??
    imageCandidate?.path ??
    ""
  );
}

function PostThumbnail({ postImage }) {
  const [thumbnailUrl, setThumbnailUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    let isCancelled = false;

    async function loadThumbnail() {
      if (!isValidImagePath(postImage)) {
        setThumbnailUrl("");
        return;
      }

      try {
        const imagePath = postImage.replace(
          "http://localhost:8080",
          "",
        );

        const response = await apiFetch(imagePath);

        if (!response.ok) {
          console.error(
            "게시글 썸네일 요청 실패:",
            response.status,
            postImage,
          );

          if (!isCancelled) {
            setThumbnailUrl("");
          }

          return;
        }

        const imageBlob = await response.blob();
        objectUrl = URL.createObjectURL(imageBlob);

        if (!isCancelled) {
          setThumbnailUrl(objectUrl);
        }
      } catch (error) {
        console.error("게시글 썸네일 표시 오류:", error);

        if (!isCancelled) {
          setThumbnailUrl("");
        }
      }
    }

    loadThumbnail();

    return () => {
      isCancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [postImage]);

  return (
    <div className="post-thumbnail">
      {thumbnailUrl && (
        <img
          className="main-photo"
          src={thumbnailUrl}
          alt="게시글 대표 이미지"
        />
      )}
    </div>
  );
}

function ProfileImage({ src, className = "" }) {
  if (!isValidImagePath(src)) {
    return null;
  }

  return (
    <img
      className={`profile-image ${className}`.trim()}
      src={src}
      alt="프로필사진"
      style={{ display: "block" }}
    />
  );
}

function PostCard({ post, onClick }) {
  return (
    <div
      className="post"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onClick();
        }
      }}
    >
      <div className="post-info">
        <span className="post-area">
          #{getAreaLabel(post.area)}
        </span>

        <PostThumbnail postImage={getThumbnailPath(post)} />

        <div className="post-title">
          {post.title}
        </div>

        <div className="post-count">
          좋아요 {formatCount(post.likeCount)} 댓글{" "}
          {formatCount(post.commentCount)} 조회수{" "}
          {formatCount(post.viewCount)}
        </div>

        <div className="post-create-date">
          {post.postCreatedAt}
        </div>
      </div>

      <hr />

      <div className="post-creator-info">
        <div className="profile-circle">
          <ProfileImage
            src={post.writerProfileImage}
            className="post-writer-profile-image"
          />
        </div>

        <div className="post-creator">
          {post.writer}
        </div>
      </div>
    </div>
  );
}

function PostsPage() {
  const navigate = useNavigate();

  const isLogin =
    localStorage.getItem("isLogin") === "true";

  const loginUserProfileImage =
    localStorage.getItem("profileImage");

  const [posts, setPosts] = useState([]);
  const [selectedArea, setSelectedArea] = useState(null);
  const [sortOption, setSortOption] = useState("latest-sort");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  /*
   * page, isLoading, hasNext를 일반 State만으로 처리하면
   * scroll 이벤트 안에서 이전 값을 참조할 수 있어서 Ref도 함께 사용한다.
   */
  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const hasNextRef = useRef(true);

  /*
  * 목록 조회 조건이 변경될 때마다 번호를 증가시켜
  * 이전 요청의 응답을 무시하기 위한 Ref
  */
  const requestVersionRef = useRef(0);

  function handleLogout() {
    localStorage.removeItem("isLogin");
    localStorage.removeItem("userId");
    localStorage.removeItem("email");
    localStorage.removeItem("nickname");
    localStorage.removeItem("profileImage");
    localStorage.removeItem("accessToken");

    alert("로그아웃 되었습니다.");
    navigate("/login");
  }

  function handlePostCreateClick(event) {
    event.preventDefault();

    if (!isLogin) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    navigate("/posts/create");
  }

  function handleAreaClick(clickedArea) {
    setSelectedArea((currentArea) => {
      if (currentArea === clickedArea) {
        return null;
      }

      return clickedArea;
    });
  }

  const loadPosts = useCallback(
  async (requestVersion = requestVersionRef.current) => {
    if (
      isLoadingRef.current ||
      !hasNextRef.current
    ) {
      return;
    }

    /*
     * 요청을 시작할 당시의 페이지 번호를 따로 저장한다.
     *
     * 응답을 기다리는 사이 pageRef.current가 변경될 수 있으므로
     * 응답 시점의 pageRef.current를 사용하면 안 된다.
     */
    const requestedPage = pageRef.current;

    isLoadingRef.current = true;
    setIsLoading(true);
    setLoadError("");

    try {
      let requestUrl =
        `/posts?page=${requestedPage}&size=${PAGE_SIZE}` +
        `&sort=${encodeURIComponent(sortOption)}`;

      if (selectedArea) {
        requestUrl +=
          `&area=${encodeURIComponent(selectedArea)}`;
      }

      const response = await apiFetch(requestUrl);

      if (!response.ok) {
        throw new Error(
          `게시글 요청 실패: ${response.status}`,
        );
      }

      const data = await response.json();
      const loadedPosts = data.content ?? [];

      /*
       * 요청 도중 지역이 변경되거나 새로운 목록 요청이 시작됐다면
       * 이전 요청의 응답은 화면에 반영하지 않는다.
       */
      if (
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      setPosts((currentPosts) => {
        /*
         * 첫 페이지는 기존 목록에 추가하지 않고 교체한다.
         */
        if (requestedPage === 0) {
          return loadedPosts;
        }

        /*
         * 다음 페이지는 기존 목록 뒤에 추가한다.
         */
        const mergedPosts = [
          ...currentPosts,
          ...loadedPosts,
        ];

        /*
         * 혹시 같은 페이지가 중복 요청되더라도
         * postId가 같은 게시글은 하나만 남긴다.
         */
        return Array.from(
          new Map(
            mergedPosts.map((post) => [
              post.postId,
              post,
            ]),
          ).values(),
        );
      });

      hasNextRef.current = !data.last;

      /*
       * 응답을 받은 시점의 현재 값에 1을 더하는 것이 아니라,
       * 실제로 요청했던 페이지의 다음 번호를 저장한다.
       */
      pageRef.current = requestedPage + 1;
    } catch (error) {
      /*
       * 이미 새로운 목록 요청이 시작된 후라면
       * 이전 요청의 오류도 화면에 표시하지 않는다.
       */
      if (
        requestVersion !== requestVersionRef.current
      ) {
        return;
      }

      console.error(
        "게시글 목록 렌더링 오류:",
        error,
      );

      setLoadError(
        "게시글 목록을 표시하는 중 오류가 발생했습니다.",
      );
    } finally {
      /*
       * 현재 유효한 요청일 때만 로딩 상태를 해제한다.
       */
      if (
        requestVersion === requestVersionRef.current
      ) {
        isLoadingRef.current = false;
        setIsLoading(false);
      }
    }
  },
  [selectedArea, sortOption],
);

  useEffect(() => {
    /*
    * 목록 조건이 변경될 때마다 요청 버전을 증가시킨다.
    * 이전 버전으로 시작한 요청의 응답은 무시된다.
    */
    requestVersionRef.current += 1;

    const currentRequestVersion =
      requestVersionRef.current;

    pageRef.current = 0;
    hasNextRef.current = true;
    isLoadingRef.current = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts([]);
    setLoadError("");

    loadPosts(currentRequestVersion);
  }, [selectedArea, sortOption, loadPosts]);

  /**
   * 무한 스크롤
   */
  useEffect(() => {
    function handleScroll() {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight =
        document.documentElement.scrollHeight;

      const reachedBottom =
        scrollTop + windowHeight >= documentHeight - 100;

      if (reachedBottom) {
        loadPosts();
      }
    }

    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [loadPosts]);

  return (
    <div className="posts-container">
      <header className="title">
        <Link to="/posts" className="home-link">
          <h1>아무 말 대잔치</h1>
        </Link>

        {isLogin && (
          <div className="profile-menu">
            <button
              type="button"
              className="user-info-btn header-profile-circle"
              aria-label="프로필 메뉴 열기"
            >
              <ProfileImage
                src={loginUserProfileImage}
                className="header-profile-image"
              />
            </button>

            <div className="profile-dropdown">
              <Link
                className="profile-dropdown-menu"
                to="/users/me"
              >
                회원정보수정
              </Link>

              <Link
                className="profile-dropdown-menu"
                to="/users/me/password"
              >
                비밀번호 수정
              </Link>

              <Link
                className="profile-dropdown-menu"
                to="/users/me/posts"
              >
                나의 기록
              </Link>

              <button
                type="button"
                className="profile-dropdown-menu logout-btn"
                onClick={handleLogout}
              >
                로그아웃
              </button>
            </div>
          </div>
        )}
      </header>

      <hr className="main-hr" />

      <main className="content">
        <p className="intro-text">
          안녕하세요,
          <br />
          아무 말 대잔치 <b>게시판</b>입니다.
        </p>

        <section className="area-filter-wrap">
          <p>지역별 태그</p>

          <div className="area-filter">
            {AREA_LIST.map((area) => (
              <button
                type="button"
                key={area.value}
                className={
                  selectedArea === area.value
                    ? "area-filter-btn active"
                    : "area-filter-btn"
                }
                onClick={() =>
                  handleAreaClick(area.value)
                }
              >
                #{area.label}
              </button>
            ))}
          </div>
        </section>

        <section className="detail-content">
          <Link
            className="post-create-btn"
            to="/posts/create"
            onClick={handlePostCreateClick}
          >
            여행 기록하기
          </Link>

          <select
            className="sort-select"
            value={sortOption}
            onChange={(event) =>
              setSortOption(event.target.value)
            }
          >
            <option value="latest-sort">
              최신순
            </option>

            <option value="like-sort">
              좋아요순
            </option>

            <option value="view-sort">
              조회수순
            </option>
          </select>

          <div className="post-list">
            {!isLoading &&
              posts.length === 0 &&
              !loadError && (
                <p className="empty-message">
                  게시글이 없습니다.
                </p>
              )}

            {posts.map((post) => (
              <PostCard
                key={post.postId}
                post={post}
                onClick={() =>
                  navigate(`/posts/${post.postId}`)
                }
              />
            ))}

            {isLoading && (
              <p className="loading-message">
                게시글을 불러오는 중입니다.
              </p>
            )}

            {loadError && (
              <p className="error-message">
                {loadError}
              </p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default PostsPage;
