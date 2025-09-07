// src/post/post_detail/postdetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './postdetail.css';
import Header from '../../components/Header';
import { createGlobalStyle } from 'styled-components';
import axios from 'axios';

axios.defaults.withCredentials = true;

// axios 인스턴스 (세션 쿠키 포함)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  withCredentials: true,
});

// ── 로컬 API 헬퍼
async function apiFetchPost(id) {
  const { data } = await api.get(`/api/posts/detail/${id}`);
  return data;
}
async function apiDeletePost(id) {
  await api.delete(`/api/posts/delete/${id}`);
  return true;
}
async function apiGetSession() {
  const res = await api.get("/api/user/session-info", { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
}

const PostDetailGlobalStyle = createGlobalStyle`
  .pd-header { display:flex; align-items:center; justify-content:space-between; gap:12px; }
  .pd-title { margin-bottom:6px; }
  .pd-meta { margin:0; color:#666; }
  .pd-meta .pd-modified { color:#8a8a8a; }
  .pd-actions { display:flex; gap:10px; }
  .pd-btn { padding:10px 14px; border-radius:12px; border:1px solid #d1d5db; background:#fff; cursor:pointer; font-size:14px; }
  .pd-btn--cancel { background:#f3f4f6; color:#374151; border-color:#e5e7eb; }
  .pd-btn--submit { background:#c7c8cc; color:#374151; border:none; box-shadow:0 2px 6px rgba(59,130,246,0.35); }
`;

const pad = (n) => String(n).padStart(2, '0');
function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const looksLikeHtml = (s='') => /<\/?[a-z][\s\S]*>/i.test(s);

function toDisplayHtml(content='') {
  if (!content) return '';
  if (looksLikeHtml(content)) return content;
  const ta = document.createElement('textarea');
  ta.innerHTML = content;
  const decoded = ta.value;
  if (looksLikeHtml(decoded)) return decoded;
  return String(content)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\r?\n/g,'<br/>');
}

function replaceBlobImages(html = '', imagePaths = []) {
  let idx = 0;
  const replaced = html.replace(
    /<img\b[^>]*src=["']blob:[^"']*["'][^>]*>/gi,
    (match) => {
      if (idx >= imagePaths.length) return '';
      const src = imagePaths[idx++];
      return match.replace(/src=["'][^"']+["']/, `src="${src}"`);
    }
  );
  return { html: replaced };
}

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  // 세션 로딩/데이터
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      return;
    }
    (async () => {
      try {
        const [data, meData] = await Promise.all([
          apiFetchPost(id),
          apiGetSession()
        ]);
        setPost(data);
        setMe(meData); // 로그인 안되어 있으면 null
      } catch (e) {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [id]);

  // ── 소유자 판별: 다양한 필드명 대응
  const postAuthorLoginId =
    post?.loginid ??
    post?.writerLoginId ??
    post?.authorLoginId ??
    post?.userLoginId ??
    null;
  const meLoginId = me?.loginid ?? me?.loginId ?? null;

  // 닉네임도 예비 비교(가능하면 loginid 비교가 우선)
  const meNick = me?.nickName ?? me?.nickname ?? null;
  const postNick = post?.nickname ?? null;

  const isOwner =
    (!!meLoginId && !!postAuthorLoginId && meLoginId === postAuthorLoginId) ||
    (!!meNick && !!postNick && meNick === postNick);

  const onEdit = () => {
    if (!isOwner) { alert('작성자만 수정할 수 있습니다.'); return; }
    navigate(`/update/${id}`);
  };
  const onDelete = async () => {
    if (!isOwner) { alert('작성자만 삭제할 수 있습니다.'); return; }
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      await apiDeletePost(id);
      alert('삭제되었습니다.');
      navigate('/postlist');
    } catch {
      alert('삭제에 실패했습니다. 권한을 확인하세요.');
    }
  };

  if (error) {
    return (
      <>
        <PostDetailGlobalStyle />
        <div className="app-root">
          <Header />
          <main className="postdetail-main">
            <div className="postdetail-main-content">
              <p className="postdetail-h3">{error}</p>
              <button onClick={() => navigate('/postlist')}>목록으로</button>
            </div>
          </main>
        </div>
      </>
    );
  }
  if (!post) {
    return (
      <>
        <PostDetailGlobalStyle />
        <div className="app-root">
          <Header />
          <main className="postdetail-main">
            <div className="postdetail-main-content">
              <p className="postdetail-h3">게시글을 불러오는 중...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  const title   = post.title || '(제목 없음)';
  const author  = post.nickname || post.loginid || '작성자';
  const uploadStr = formatDate(post.uploaddate);
  const modifyStr =
    post.modifydate &&
    new Date(post.modifydate).getTime() !== new Date(post.uploaddate || 0).getTime()
      ? formatDate(post.modifydate)
      : null;

  const content = post.content || '';
  const uploadedImages = [
    post.imagepath0, post.imagepath1, post.imagepath2, post.imagepath3, post.imagepath4
  ].filter(Boolean);

  const baseHtml = toDisplayHtml(content);
  const { html: htmlNoBlob } = replaceBlobImages(baseHtml, uploadedImages);

  return (
    <>
      <PostDetailGlobalStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* 사이드바 */}
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box">
                <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar"/>
              </figure>
              <div className="postdetail-info-content">
                <h1 className="postdetail-name" title="Writer">{author}</h1>
                <p className="postdetail-title">Web Developer</p>
              </div>
              <button className="postdetail-info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
                <span>Show Contacts</span>
                <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
              </button>
            </div>
            <div className="postdetail-sidebar-info-more">
              <div className="postdetail-separator" />
              {/* 연락처 데모 섹션 필요 시 유지/수정 */}
            </div>
          </aside>

          {/* 본문 + 버튼 */}
          <div className="postdetail-main-content">
            <article className="postdetail-article postdetail-about active" data-page="about">
              <header className="pd-header">
                <div>
                  <h2 className="postdetail-h2 postdetail-article-title pd-title">{title}</h2>
                  <p className="pd-meta">
                    {uploadStr && <> <span>작성일 {uploadStr}</span></>}
                    {modifyStr && <span className="pd-modified"> (최종 수정일: {modifyStr})</span>}
                  </p>
                </div>

                {/* 작성자 본인에게만 수정/삭제 노출 */}
                {!loadingMe && isOwner && (
                  <div className="pd-actions">
                    <button onClick={onEdit} className="pd-btn pd-btn--submit">수정</button>
                    <button onClick={onDelete} className="pd-btn pd-btn--cancel">삭제</button>
                  </div>
                )}
              </header>

              <section className="postdetail-about-text">
                {htmlNoBlob ? (
                  <div dangerouslySetInnerHTML={{ __html: htmlNoBlob }} />
                ) : (
                  <p>(내용 없음)</p>
                )}
              </section>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
