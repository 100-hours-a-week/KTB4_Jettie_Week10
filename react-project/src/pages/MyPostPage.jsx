import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import { toRelativeAssetUrl } from "../utils/url.js";
import PageHeader, { ProfileImage } from "../components/PageHeader.jsx";
import "./MyPostPage.css";

const AREA = { SEOUL:"서울", GYEONGGI:"경기", INCHEON:"인천", GANGWON:"강원", DAEJEON:"대전", SEJONG:"세종", CHUNGBUK:"충북", CHUNGNAM:"충남", DAEGU:"대구", GYEONGBUK:"경북", BUSAN:"부산", ULSAN:"울산", GYEONGNAM:"경남", GWANGJU:"광주", JEONBUK:"전북", JEONNAM:"전남", JEJU:"제주" };
const formatCount = (value) => value >= 1000 ? `${Math.floor(value / 1000)}k` : (value ?? 0);
const PAGE_SIZE = 10;

function Thumbnail({ path }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let url = "";
    if (!path) return undefined;
    apiFetch(toRelativeAssetUrl(path))
      .then(async (response) => {
        if (response.ok) {
          url = URL.createObjectURL(await response.blob());
          setSrc(url);
        }
      })
      .catch(() => setSrc(""));
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [path]);
  return (
    <div className="post-thumbnail">
      {src && <img className="main-photo" src={src} alt="게시글 대표 이미지" />}
    </div>
  );
}

function MyPostPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [sort, setSort] = useState("latest-sort");
  const [loading, setLoading] = useState(false);
  const pageRef = useRef(0);
  const isLoadingRef = useRef(false);
  const hasNextRef = useRef(true);
  const requestVersionRef = useRef(0);

  const loadPosts = useCallback(async (
    requestVersion = requestVersionRef.current
  ) => {
    if (isLoadingRef.current || !hasNextRef.current) return;

    const requestedPage = pageRef.current;

    isLoadingRef.current = true;
    setLoading(true);

    try {
      const response = await apiFetch(
        `/posts/me?page=${requestedPage}&size=${PAGE_SIZE}&sort=${encodeURIComponent(sort)}`
      );
      if (!response.ok) throw new Error();

      const data = await response.json();
      const loadedPosts = data.content ?? [];

      if (requestVersion !== requestVersionRef.current) return;

      setTotalElements(data.totalElements ?? 0);
      setPosts((currentPosts) => {
        if (requestedPage === 0) return loadedPosts;

        const mergedPosts = [...currentPosts, ...loadedPosts];

        return Array.from(
          new Map(
            mergedPosts.map((post) => [post.postId, post])
          ).values()
        );
      });

      pageRef.current = requestedPage + 1;
      hasNextRef.current = !data.last;
    } catch {
      if (requestVersion === requestVersionRef.current) {
        alert("내 게시글을 불러오지 못했습니다.");
      }
    } finally {
      if (requestVersion === requestVersionRef.current) {
        isLoadingRef.current = false;
        setLoading(false);
      }
    }
  }, [sort]);

  useEffect(() => {
    requestVersionRef.current += 1;
    const currentRequestVersion = requestVersionRef.current;

    pageRef.current = 0;
    hasNextRef.current = true;
    isLoadingRef.current = false;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPosts([]);
    setTotalElements(0);
    setLoading(false);

    loadPosts(currentRequestVersion);
  }, [sort, loadPosts]);

  useEffect(() => {
    const scroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 150) loadPosts();
    };
    window.addEventListener("scroll", scroll);
    return () => window.removeEventListener("scroll", scroll);
  }, [loadPosts]);

  return (
    <div className="posts-container my-post-page">
      <PageHeader backTo="/posts" />
      <main className="content">
        <h2>나의 기록</h2>
        <p className="my-post-total">🐾 {totalElements}개의 발자국</p>
        <div className="detail-content">
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest-sort">최신순</option>
            <option value="like-sort">좋아요순</option>
            <option value="view-sort">조회수순</option>
          </select>
          <div className="post-list">
            {!loading && posts.length === 0 && <p className="empty-message">첫 발자국을 남겨보세요!</p>}
            {posts.map((post) => (
              <article className="post" key={post.postId} onClick={() => navigate(`/posts/${post.postId}`)}>
                <div className="post-info">
                  <span className="post-area">🐾 {AREA[post.area] ?? "지역 없음"}</span>
                  <Thumbnail path={post.representativeImage ?? post.postImage} />
                  <div className="post-title">{post.title}</div>
                  {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
                    <div className="post-hashtags">
                      {post.hashtags.map((hashtag) => (
                        <button
                          type="button"
                          className="post-hashtag"
                          key={hashtag}
                          onClick={(event) => {
                            event.stopPropagation();
                            navigate(`/posts?hashtag=${encodeURIComponent(hashtag)}`);
                          }}
                        >
                          #{hashtag}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="post-count">
                    <span>❤️ {formatCount(post.likeCount)}</span>
                    <span>💬 {formatCount(post.commentCount)}</span>
                    <span>👀 {formatCount(post.viewCount)}</span>
                  </div>
                  <span className="post-create-date">{post.postCreatedAt}</span>
                </div><hr />
                <div className="post-creator-info">
                  <div className="profile-circle"><ProfileImage src={post.writerProfileImage} /></div>
                  <div className="post-creator">{post.writer}</div>
                </div>
              </article>
            ))}
            {loading && <p className="empty-message">불러오는 중...</p>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default MyPostPage;
