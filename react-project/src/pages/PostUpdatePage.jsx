import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch } from "../api/api.js";
import { toRelativeAssetUrl } from "../utils/url.js";
import PageHeader from "../components/PageHeader.jsx";
import "./PostUpdatePage.css";

const AREAS = [
  ["SEOUL", "서울"], ["GYEONGGI", "경기"], ["INCHEON", "인천"], ["GANGWON", "강원"],
  ["DAEJEON", "대전"], ["SEJONG", "세종"], ["CHUNGBUK", "충북"], ["CHUNGNAM", "충남"],
  ["DAEGU", "대구"], ["GYEONGBUK", "경북"], ["BUSAN", "부산"], ["ULSAN", "울산"],
  ["GYEONGNAM", "경남"], ["GWANGJU", "광주"], ["JEONBUK", "전북"],
  ["JEONNAM", "전남"], ["JEJU", "제주"],
];

function PostUpdatePage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [area, setArea] = useState("");
  const [images, setImages] = useState([]);
  const [originalImageIds, setOriginalImageIds] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const newPreviewUrlsRef = useRef(new Set());

  useEffect(() => () => {
    newPreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    newPreviewUrlsRef.current.clear();
  }, []);

  useEffect(() => {
    const objectUrls = [];
    let cancelled = false;
    async function load() {
      try {
        const response = await apiFetch(`/posts/${postId}`);
        if (!response.ok) throw new Error();
        const post = await response.json();
        setTitle(post.title);
        setContent(post.content);
        setArea(post.area);
        const storedImages = post.postImages?.length
          ? [...post.postImages].sort((a, b) => a.imageOrder - b.imageOrder)
          : [{ imageUrl: post.representativeImage ?? post.postImage }]
              .filter((image) => image.imageUrl);

        const loadedImages = await Promise.all(storedImages.map(async (storedImage, index) => {
          const imagePath = toRelativeAssetUrl(storedImage.imageUrl);
          const response = await apiFetch(imagePath);
          if (!response.ok) return null;

          const imageBlob = await response.blob();
          const previewUrl = URL.createObjectURL(imageBlob);
          objectUrls.push(previewUrl);

          if (storedImage.imageId == null) {
            const filename = imagePath.split("/").pop() || `legacy-post-image-${index + 1}`;
            const file = new File([imageBlob], filename, {
              type: imageBlob.type || "image/jpeg",
            });

            return {
              key: `legacy-${index}`,
              type: "new",
              file,
              previewUrl,
            };
          }

          return {
            key: `existing-${storedImage.imageId}`,
            type: "existing",
            imageId: storedImage.imageId,
            previewUrl,
          };
        }));
        if (!cancelled) {
          const validImages = loadedImages.filter(Boolean);
          setImages(validImages);
          setOriginalImageIds(validImages.map((image) => image.imageId));
        }
      } catch {
        alert("게시글을 불러오지 못했습니다.");
        navigate("/posts");
      }
    }
    load();
    return () => {
      cancelled = true;
      objectUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [navigate, postId]);

  function selectImages(event) {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;
    if (files.some((file) => !file.type.startsWith("image/"))) {
      alert("이미지 파일만 선택할 수 있습니다.");
      event.target.value = "";
      return;
    }
    if (images.length + files.length > 10) {
      alert("기존 이미지와 새 이미지를 합쳐 최대 10장까지 등록할 수 있습니다.");
      event.target.value = "";
      return;
    }
    const added = files.map((file) => {
      const previewUrl = URL.createObjectURL(file);
      newPreviewUrlsRef.current.add(previewUrl);
      return { key: `new-${crypto.randomUUID()}`, type: "new", file, previewUrl };
    });
    setImages((current) => [...current, ...added]);
    event.target.value = "";
  }

  function removeImage(index) {
    if (images.length === 1) return setError("* 이미지는 최소 1장 남아 있어야 합니다.");
    const target = images[index];
    if (target.type === "new") {
      URL.revokeObjectURL(target.previewUrl);
      newPreviewUrlsRef.current.delete(target.previewUrl);
    }
    setImages((current) => current.filter((_, itemIndex) => itemIndex !== index));
    setError("");
  }

  function moveImage(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) return;
    setImages((current) => {
      const copied = [...current];
      [copied[index], copied[nextIndex]] = [copied[nextIndex], copied[index]];
      return copied;
    });
  }

  async function submit(event) {
    event.preventDefault();
    if (!title.trim() || !content.trim()) return setError("* 제목, 내용을 모두 작성해주세요.");
    if (!area) return setError("* 지역을 선택해주세요.");
    if (images.length < 1 || images.length > 10) return setError("* 이미지는 1장 이상 10장 이하여야 합니다.");
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("content", content.trim());
    formData.append("area", area);
    const retainedIds = images.filter((item) => item.type === "existing").map((item) => item.imageId);
    const deletedIds = originalImageIds.filter((imageId) => !retainedIds.includes(imageId));
    retainedIds.forEach((imageId) => formData.append("retainedImageIds", imageId));
    deletedIds.forEach((imageId) => formData.append("deletedImageIds", imageId));
    const newItems = images.filter((item) => item.type === "new");
    newItems.forEach((item) => formData.append("newImages", item.file));
    images.forEach((item) => {
      if (item.type === "existing") {
        formData.append("imageOrder", `existing:${item.imageId}`);
      } else {
        formData.append("imageOrder", `new:${newItems.indexOf(item)}`);
      }
    });
    try {
      setSubmitting(true);
      const response = await apiFetch(`/posts/${postId}`, { method: "PATCH", body: formData });
      if (!response.ok) return alert(await response.text());
      navigate(`/posts/${postId}`);
    } catch { alert("서버와 연결할 수 없습니다."); }
    finally { setSubmitting(false); }
  }

  const valid = Boolean(
    title.trim() &&
    content.trim() &&
    area &&
    images.length >= 1 &&
    images.length <= 10
  );
  return (
    <div className="post-update-container">
      <PageHeader backTo={`/posts/${postId}`} />
      <div className="content-wrap">
        <h2>게시글 수정</h2>
        <form className="content" onSubmit={submit}>
          <div><label htmlFor="update-title">제목*</label></div><hr />
          <div><input id="update-title" value={title} maxLength={26} onChange={(e) => { setTitle(e.target.value); setError(""); }} /></div><hr />
          <div><label htmlFor="update-content">내용*</label></div><hr />
          <div><textarea id="update-content" value={content} onChange={(e) => { setContent(e.target.value); setError(""); }} /></div><hr />
          <div>
            <span className="area-select-label">지역*</span>
            <div className="area-select">
              {AREAS.map(([value, label]) => (
                <label className="area-option" key={value}>
                  <input type="radio" name="area" value={value} checked={area === value} onChange={() => setArea(value)} />
                  <span>#{label}</span>
                </label>
              ))}
            </div>
          </div><hr />
          <div>
            <label htmlFor="post-image">이미지 ({images.length}/10)</label>
            <input type="file" id="post-image" accept="image/*" multiple onChange={selectImages} />
            <div className="update-image-list">
              {images.map((item, index) => (
                <div className="update-image-item" key={item.key}>
                  <img src={item.previewUrl} alt={`게시글 이미지 ${index + 1}`} />
                  <span>{index === 0 ? "대표 이미지" : `${index + 1}번째 이미지`}</span>
                  <div className="update-image-actions">
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0}>위로</button>
                    <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1}>아래로</button>
                    <button type="button" onClick={() => removeImage(index)} disabled={images.length === 1}>삭제</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <span className="error-message">{error}</span>
          <button
            className={`post-update-btn ${valid ? "active" : ""}`}
            disabled={!valid || submitting}
          >
            {submitting ? "수정 중..." : "수정하기"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default PostUpdatePage;
