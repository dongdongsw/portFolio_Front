// src/post/post_detail/PostDetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './postdetail.css';
import Header from '../../components/Header';
import { createGlobalStyle } from 'styled-components';
import CommentsApp from './../../comment/comment';
import axios from 'axios';

/** Axios 2종: 1) 같은 오리진(+쿠키), 2) 8080 직접(쿠키X) */
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';
const sameOrigin = axios.create({ baseURL: "", withCredentials: true });
const direct8080 = axios.create({ baseURL: API_BASE, withCredentials: false });

const DEFAULT_AVATAR = '/default_profile.png';

/** ✅ 이미지 경로 보정: /uploads/profile 기준으로 안전 처리 */
const toImageSrc = (p) => {
  if (!p) return DEFAULT_AVATAR;
  if (/^(https?:)?\/\//i.test(p) || /^blob:/i.test(p)) return p;

  let path = String(p).trim().replace(/^\.?\/*/, '');

  if (/^uploads\/profile\//i.test(path)) return `${API_BASE}/${path}`;
  if (/^\/uploads\/profile\//i.test(p))  return `${API_BASE}${p}`;

  if (/^profile\//i.test(path))  return `${API_BASE}/uploads/${path}`.replace('/profile/', '/profile/');
  if (/^\/profile\//i.test(p))   return `${API_BASE}/uploads${p}`;

  if (/^(images|uploads\/images|static)\//i.test(path)) return `${API_BASE}/${path}`;

  return `${API_BASE}/uploads/profile/${path}`;
};
const bust = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();

/* ---------------- API ---------------- */
async function fetchPost(id) {
  const { data } = await sameOrigin.get(`/api/posts/detail/${id}`);
  return data;
}
async function apiGetSession() {
  const res = await sameOrigin.get('/api/user/session-info', { validateStatus: () => true });
  return res.status === 200 ? res.data : null; // 미로그인/403이면 null
}
async function apiDeletePost(id) {
  const res = await sameOrigin.delete(`/api/posts/delete/${id}`, { validateStatus: () => true });
  if (res.status >= 200 && res.status < 300) return true;
  throw new Error(`삭제 실패(${res.status})`);
}

/** ✅ 작성자 조회: /api/posts/author?loginid=... (permitAll) */
const AUTHOR_PATHS = [
  (loginid) => `/api/posts/author?loginid=${encodeURIComponent(loginid)}`,
];
async function fetchAuthorCascade(loginid) {
  const attempts = [];
  for (const b of AUTHOR_PATHS) attempts.push({ client: 'sameOrigin', url: b(loginid) });
  for (const b of AUTHOR_PATHS) attempts.push({ client: 'direct8080', url: b(loginid) });

  for (const { client, url } of attempts) {
    try {
      const cli = client === 'sameOrigin' ? sameOrigin : direct8080;
      const res = await cli.get(url, { validateStatus: () => true });
      if (res.status >= 200 && res.status < 300 && res.data) {
        const u = res.data;
        return {
          loginId  : u.loginId ?? u.loginid ?? loginid,
          nickname : u.nickName ?? u.nickname ?? '',
          email    : u.email ?? '',
          phone    : u.phone ?? '',
          birthday : u.birthday ?? '',
          imagePath: u.imagePath ?? u.imagepath ?? '',
          location : u.location ?? '',
          _source  : `${client} ${url}`,
        };
      }
    } catch {}
  }
  return null;
}

/* ---------------- 스타일 ---------------- */
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

/* ---------------- 유틸 ---------------- */
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
    (m) => {
      if (idx >= imagePaths.length) return '';
      const src = bust(toImageSrc(imagePaths[idx++] ?? ''));
      return m.replace(/src=["'][^"']+["']/, `src="${src}"`);
    }
  );
  return { html: replaced };
}
function formatDateToYYYYMMDD(s) {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/* ---------------- 컴포넌트 ---------------- */
export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [postError, setPostError] = useState('');

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [author, setAuthor] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState('');

  const [sidebarOpen, setSidebarOpen] = useState(true); // 기본 펼침

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // 1) 게시글, 2) 세션 병행 로드
  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setPostError('잘못된 게시글 주소입니다.');
      return;
    }
    (async () => {
      try {
        const [postData, sessionData] = await Promise.all([
          fetchPost(id),
          apiGetSession(),
        ]);
        setPost(postData);
        setMe(sessionData);
      } catch {
        setPostError('게시글을 불러오지 못했습니다.');
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [id]);

  // 소유자 판별용 loginid
  const postAuthorLoginId =
    post?.loginid ?? post?.writerLoginId ?? post?.authorLoginId ?? post?.userLoginId ?? null;
  const meLoginId = me?.loginid ?? me?.loginId ?? null;

  // 3) 작성자 정보(USER 테이블) — ✅ loginid로만 조회
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!post) return;
      const loginid = post?.loginid ?? post?.writerLoginId ?? post?.authorLoginId ?? post?.userLoginId ?? null;
      if (!loginid) {
        setAuthor(null);
        setAuthorError('작성자 로그인 아이디가 없어 사용자 정보를 조회할 수 없습니다.');
        return;
      }
      setAuthorLoading(true);
      setAuthorError('');
      try {
        const u = await fetchAuthorCascade(loginid);
        if (!alive) return;
        if (!u) {
          setAuthor(null);
          setAuthorError('사용자 정보를 가져오지 못했습니다.');
        } else {
          setAuthor(u);
        }
      } catch {
        if (!alive) return;
        setAuthor(null);
        setAuthorError('작성자 정보를 불러오지 못했습니다.');
      } finally {
        if (alive) setAuthorLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [post]);

  // ✅ 소유자 판별: loginid만 사용
  const isOwner = !!meLoginId && !!postAuthorLoginId && meLoginId === postAuthorLoginId;

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

  // 로딩/에러 처리
  if (postError) {
    return (
      <>
        <PostDetailGlobalStyle />
        <div className="app-root">
          <Header />
          <main className="postdetail-main">
            <div className="postdetail-main-content">
              <p className="postdetail-h3">{postError}</p>
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

  // 본문/메타
  const title     = post.title || '(제목 없음)';
  const uploadStr = formatDate(post.uploaddate);
  const modifyStr =
    post.modifydate &&
    new Date(post.modifydate).getTime() !== new Date(post.uploaddate || 0).getTime()
      ? formatDate(post.modifydate)
      : null;

  const content = post.content || '';
  const images = [post.imagepath0, post.imagepath1, post.imagepath2, post.imagepath3, post.imagepath4].filter(Boolean);
  const baseHtml = toDisplayHtml(content);
  const { html: htmlNoBlob } = replaceBlobImages(baseHtml, images);

  // 사이드바: 작성자(User) 정보
  const avatarSrc = bust(toImageSrc(author?.imagePath));
  const email = (author?.email ?? '').trim() || '(미등록)';
  const phone = (author?.phone ?? '').trim() || '(미등록)';
  const birthday = (author?.birthday ? formatDateToYYYYMMDD(author.birthday) : '').trim() || '(미등록)';
  const location = (author?.location ?? '').trim() || '(미등록)';

  const onAvatarError = (e) => { e.currentTarget.src = DEFAULT_AVATAR; };

  return (
    <>
      <PostDetailGlobalStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* 사이드바: 작성자 정보 */}
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box">
                {authorLoading ? (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee' }} />
                ) : (
                  <img src={avatarSrc} alt="author avatar" width="80" onError={onAvatarError} />
                )}
              </figure>
              <div className="postdetail-info-content">
                <h1 className="postdetail-name">
                  {/* 닉네임이 있으면 닉네임, 없으면 loginId 표시 */}
                  {author?.nickname || post?.nickname || author?.loginId || '(작성자)'}
                </h1>
                <p className="postdetail-title">Author</p>
              </div>
              <button
                className="postdetail-info-more-btn"
                data-sidebar-btn
                onClick={() => setSidebarOpen(o=>!o)}
                aria-expanded={sidebarOpen}
              >
                <span>{sidebarOpen ? 'Hide Contacts' : 'Show Contacts'}</span>
                <ion-icon name="chevron-down" aria-hidden="true" />
              </button>
            </div>

            <div className="postdetail-sidebar-info-more">
              <div className="postdetail-separator" />
              {authorError ? (
                <div style={{ color: '#b00020' }}>{authorError}</div>
              ) : (
                <ul className="postdetail-contacts-list">
                  <li className="postdetail-contact-item">
                    <div className="postdetail-icon-box">
                        <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/new-post.png" alt="new-post"/>
                    </div>
                    <div className="postdetail-contact-info">
                      <p className="postdetail-contact-title">Email</p>
                      <p className="postdetail-contact-link">{email}</p>
                    </div>
                  </li>
                  <li className="postdetail-contact-item">
                    <div className="postdetail-icon-box">
                      <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/phone--v1.png" alt="phone--v1"/>
                    </div>
                    <div className="postdetail-contact-info">
                      <p className="postdetail-contact-title">Phone</p>
                      <p className="postdetail-contact-link">{phone}</p>
                    </div>
                  </li>
                  <li className="postdetail-contact-item">
                    <div className="postdetail-icon-box">
                      <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/birthday.png" alt="birthday"/>
                    </div>
                    <div className="postdetail-contact-info">
                      <p className="postdetail-contact-title">Birthday</p>
                      <p className="postdetail-contact-link">{birthday}</p>
                    </div>
                  </li>
                  <li className="postdetail-contact-item">
                    <div className="postdetail-icon-box">
                      <img width="30" height="30" src="https://img.icons8.com/material-sharp/24/marker.png" alt="marker"/>
                    </div>
                    <div className="postdetail-contact-info">
                      <p className="postdetail-contact-title">Location</p>
                      <p className="postdetail-contact-link">{location}</p>
                    </div>
                  </li>
                </ul>
              )}
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

                {/* ✅ 세션으로 소유자 판별하여 동일 디자인의 수정/삭제 버튼 노출 */}
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
            <section className="postdetail-comment-section">
              <h3 className="postdetail-h3 postdetail-comment-title">Comments</h3>
              <div className="postdetail-comments-container">
                <CommentsApp/>
              </div>
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
