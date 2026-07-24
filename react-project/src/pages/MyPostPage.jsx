import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import PageHeader, { ProfileImage } from "../components/PageHeader.jsx";
import "./MyPostPage.css";

const AREA = { SEOUL:"서울", GYEONGGI:"경기", INCHEON:"인천", GANGWON:"강원", DAEJEON:"대전", SEJONG:"세종", CHUNGBUK:"충북", CHUNGNAM:"충남", DAEGU:"대구", GYEONGBUK:"경북", BUSAN:"부산", ULSAN:"울산", GYEONGNAM:"경남", GWANGJU:"광주", JEONBUK:"전북", JEONNAM:"전남", JEJU:"제주" };
const formatCount = (value) => value >= 1000 ? `${Math.floor(value / 1000)}k` : (value ?? 0);

function Thumbnail({ path }) {
  const [src, setSrc] = useState("");
  useEffect(() => {
    let url = "";
    if (!path) return undefined;
    apiFetch(path.replace("http://localhost:8080", ""))
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
  const [sort, setSort] = useState("latest-sort");
  const [loading, setLoading] = useState(false);
  const page = useRef(0);
  const hasNext = useRef(true);

  const loadPosts = useCallback(async (reset = false) => {
    if (loading || (!reset && !hasNext.current)) return;
    setLoading(true);
    const nextPage = reset ? 0 : page.current;
    try {
      const userId = localStorage.getItem("userId");
      const response = await apiFetch(`/posts?page=${nextPage}&size=10&userId=${userId}&sort=${sort}`);
      if (!response.ok) throw new Error();
      const data = await response.json();
      setPosts((current) => reset ? data.content : [...current, ...data.content]);
      page.current = nextPage + 1;
      hasNext.current = !data.last;
    } catch { alert("내 게시글을 불러오지 못했습니다."); }
    finally { setLoading(false); }
  }, [loading, sort]);

  useEffect(() => { page.current = 0; hasNext.current = true; loadPosts(true); }, [sort]); // eslint-disable-line react-hooks/exhaustive-deps
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
        <div className="detail-content">
          <select className="sort-select" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="latest-sort">최신순</option>
            <option value="like-sort">좋아요순</option>
            <option value="view-sort">조회수순</option>
          </select>
          <div className="post-list">
            {!loading && posts.length === 0 && <p className="empty-message">작성한 게시글이 없습니다.</p>}
            {posts.map((post) => (
              <article className="post" key={post.postId} onClick={() => navigate(`/posts/${post.postId}`)}>
                <div className="post-info">
                  <span className="post-area">#{AREA[post.area] ?? "지역 없음"}</span>
                  <Thumbnail path={post.representativeImage ?? post.postImage} />
                  <div className="post-title">{post.title}</div>
                  <div className="post-count">
                    좋아요 {formatCount(post.likeCount)} 댓글 {formatCount(post.commentCount)} 조회수 {formatCount(post.viewCount)}
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
