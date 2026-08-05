import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import { toRelativeAssetUrl } from "../utils/url.js";
import PageHeader, { ProfileImage } from "../components/PageHeader.jsx";
import useAuth from "../hooks/useAuth.js";
import "./PostPage.css";

const AREA = { SEOUL:"서울", GYEONGGI:"경기", INCHEON:"인천", GANGWON:"강원", DAEJEON:"대전", SEJONG:"세종", CHUNGBUK:"충북", CHUNGNAM:"충남", DAEGU:"대구", GYEONGBUK:"경북", BUSAN:"부산", ULSAN:"울산", GYEONGNAM:"경남", GWANGJU:"광주", JEONBUK:"전북", JEONNAM:"전남", JEJU:"제주" };

function ConfirmModal({ open, title, onCancel, onConfirm }) {
  return (
    <div className={`modal-overlay ${open ? "active" : ""}`}>
      <div className="post-delete-modal">
        <p className="modal-title">{title}</p>
        <p className="modal-content">삭제된 내용은 복구할 수 없습니다.</p>
        <div className="modal-btn-wrap">
          <button className="cancel-btn" onClick={onCancel}>취소</button>
          <button className="post-delete-confirm-btn" onClick={onConfirm}>확인</button>
        </div>
      </div>
    </div>
  );
}

function PostPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const {
    authenticated,
    userId,
  } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [imageUrls, setImageUrls] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [comment, setComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deletePostOpen, setDeletePostOpen] = useState(false);

  function requireLogin() {
    if (authenticated) return true;

    alert("로그인이 필요합니다.");
    navigate("/login", {
      state: { from: `/posts/${postId}` },
    });
    return false;
  }

  function handleBack() {
    if ((window.history.state?.idx ?? 0) > 0) {
      navigate(-1);
      return;
    }

    navigate("/posts");
  }

  const loadComments = useCallback(async () => {
    try {
      const response = await apiFetch(`/posts/${postId}/comments`);
      if (!response.ok) throw new Error();
      setComments(await response.json());
    } catch { alert("댓글을 불러오지 못했습니다."); }
  }, [postId]);

  useEffect(() => {
    const objectUrls = [];
    let cancelled = false;
    async function load() {
      try {
        const response = await apiFetch(`/posts/${postId}`);
        if (!response.ok) throw new Error();
        const value = await response.json();
        if (cancelled) return;
        setPost(value);
        const images = value.postImages?.length
          ? [...value.postImages].sort((a, b) => a.imageOrder - b.imageOrder)
          : [{ imageUrl: value.representativeImage ?? value.postImage }];
        const loaded = await Promise.all(images.filter((image) => image.imageUrl).map(async (image) => {
          const path = toRelativeAssetUrl(image.imageUrl);
          const imageResponse = await apiFetch(path);
          if (!imageResponse.ok) return null;
          const url = URL.createObjectURL(await imageResponse.blob());
          objectUrls.push(url);
          return url;
        }));
        if (!cancelled) {
          setImageUrls(loaded.filter(Boolean));
          setCurrentImageIndex(0);
        }
      } catch { alert("게시글을 불러오지 못했습니다."); navigate("/posts"); }
    }
    load();
    // 댓글 초기 조회는 게시글 상세 Effect와 같은 시점에 한 번 실행한다.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadComments();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [loadComments, navigate, postId, userId]);

  async function toggleLike() {
    if (!requireLogin()) return;

    const action = post.likedByMe ? "unlike" : "like";
    try {
      const response = await apiFetch(`/posts/${postId}/${action}`, { method: "PATCH" });
      if (!response.ok) return alert("좋아요 처리에 실패했습니다.");
      setPost(await response.json());
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  async function saveComment() {
    if (!requireLogin()) return;

    const value = comment.trim();
    if (!value) return;
    const url = editingId ? `/posts/${postId}/comments/${editingId}` : `/posts/${postId}/comments`;
    const body = { commentContent: value };
    try {
      const response = await apiFetch(url, { method: editingId ? "PATCH" : "POST", body: JSON.stringify(body) });
      if (!response.ok) return alert("댓글 처리에 실패했습니다.");
      setComment(""); setEditingId(null); await loadComments();
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  async function deleteComment() {
    try {
      const response = await apiFetch(`/posts/${postId}/comments/${deletingId}`, { method: "DELETE" });
      if (!response.ok) return alert("댓글 삭제에 실패했습니다.");
      setDeletingId(null); await loadComments();
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  async function deletePost() {
    try {
      const response = await apiFetch(`/posts/${postId}`, { method: "DELETE" });
      if (!response.ok) return alert("게시글 삭제에 실패했습니다.");
      navigate("/posts");
    } catch { alert("서버와 연결할 수 없습니다."); }
  }

  if (!post) return <div className="post-container"><PageHeader backTo="/posts" onBack={handleBack} /><p>불러오는 중...</p></div>;

  return (
    <div className="post-container">
      <PageHeader backTo="/posts" onBack={handleBack} />
      <main className="content">
        <div className="post-wrap">
          <div className="post-info-wrap">
            <div className="post-title">
              <span className="post-area">🐾 {AREA[post.area] ?? "지역 없음"}</span>
              {post.title}
            </div>
            <div className="post-info">
              <div className="post-creator-info">
                <div className="post-creator">
                  <div className="profile-circle">
                    <ProfileImage src={post.writerProfileImage} />
                  </div>
                  <span>{post.writer}</span>
                </div>
                <span className="post-create-date">{post.postCreatedAt}</span>
              </div>
              {userId === post.writerId && <div className="post-actions">
                <Link className="post-btn" to={`/posts/${postId}/edit`}>수정</Link>
                <button className="post-btn" onClick={() => setDeletePostOpen(true)}>삭제</button>
              </div>}
            </div>
          </div><hr />
          <div className="post-content-wrap">
            {imageUrls.length > 0 && (
              <div className="post-carousel">
                <img className="post-image" src={imageUrls[currentImageIndex]} alt={`게시글 이미지 ${currentImageIndex + 1}`} />
                {imageUrls.length > 1 && (
                  <>
                    <button className="carousel-btn carousel-prev" type="button" onClick={() => setCurrentImageIndex((index) => (index - 1 + imageUrls.length) % imageUrls.length)} aria-label="이전 이미지">‹</button>
                    <button className="carousel-btn carousel-next" type="button" onClick={() => setCurrentImageIndex((index) => (index + 1) % imageUrls.length)} aria-label="다음 이미지">›</button>
                  </>
                )}
                <span className="carousel-counter">{currentImageIndex + 1} / {imageUrls.length}</span>
              </div>
            )}
            <div className="post-content">{post.content}</div>
            {Array.isArray(post.hashtags) && post.hashtags.length > 0 && (
              <div className="post-hashtags">
                {post.hashtags.map((hashtag) => (
                  <button
                    type="button"
                    className="post-hashtag"
                    key={hashtag}
                    onClick={() => navigate(`/posts?hashtag=${encodeURIComponent(hashtag)}`)}
                  >
                    #{hashtag}
                  </button>
                ))}
              </div>
            )}
            <div className="post-count-wrap">
              <button className={`post-count ${post.likedByMe ? "active" : ""}`} id="liked-count-btn" onClick={toggleLike}><span>❤️ {post.likeCount}</span></button>
              <button className="post-count"><span>💬 {comments.length}</span></button>
              <button className="post-count"><span>👀 {post.viewCount}</span></button>
            </div>
          </div>
        </div><hr />
        <div className="comment-wrap">
          <div className="comment-create">
            <div className="comment-create-input"><textarea id="comment-create" value={comment} placeholder="댓글을 남겨주세요!" onChange={(e) => setComment(e.target.value)} /></div><hr />
            <button
              className={`comment-create-btn ${comment.trim() ? "active" : ""}`}
              onClick={saveComment}
              disabled={!comment.trim()}
            >
              {editingId ? "댓글 수정" : "댓글 등록"}
            </button>
          </div>
          <div className="comments">
            {comments.map((item) => <div className="comment" key={item.commentId}>
              <div className="comment-info">
                <div className="comment-detail-info"><div className="profile-circle"><ProfileImage src={item.writerProfileImage} /></div><span className="comment-creator">{item.writer}</span><span className="comment-create-date">{item.commentCreatedAt}</span></div>
                <div className="comment-content">{item.commentContent}</div>
              </div>
              {userId === item.writerId && <div className="comment-actions">
                <button className="comment-actions-btn" onClick={() => { setEditingId(item.commentId); setComment(item.commentContent); }}>수정</button>
                <button className="comment-actions-btn" onClick={() => setDeletingId(item.commentId)}>삭제</button>
              </div>}
            </div>)}
          </div>
        </div>
      </main>
      <ConfirmModal open={deletePostOpen} title="게시글을 삭제하시겠습니까?" onCancel={() => setDeletePostOpen(false)} onConfirm={deletePost} />
      <ConfirmModal open={deletingId !== null} title="댓글을 삭제하시겠습니까?" onCancel={() => setDeletingId(null)} onConfirm={deleteComment} />
    </div>
  );
}

export default PostPage;
