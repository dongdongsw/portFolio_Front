// src/post/post_update/PostUpdate.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';
import UpdateEditor from './updateeditor';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

axios.defaults.withCredentials = true;

/** ===== Axios 2종 =====
 * sameOrigin : 같은 오리진(/api/.., 쿠키 포함)
 * direct8080 : http://localhost:8080 직접(쿠키 불필요)
 */
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';
const sameOrigin = axios.create({ baseURL: "", withCredentials: true });
const direct8080 = axios.create({ baseURL: API_BASE, withCredentials: false });

const DEFAULT_AVATAR = '/default_profile.png';

/** ✅ 이미지 경로 보정: /uploads/profile 를 1순위로 보정 */
const toImageSrc = (p) => {
  if (!p) return DEFAULT_AVATAR;
  if (/^(https?:)?\/\//i.test(p) || /^blob:/i.test(p)) return p;

  let path = String(p).trim().replace(/^\.?\/*/, ''); // ./, / 정리

  // /uploads/profile/xxx 이미면 그대로
  if (/^uploads\/profile\//i.test(path)) return `${API_BASE}/${path}`;
  if (/^\/uploads\/profile\//i.test(p))  return `${API_BASE}${p}`;

  // 과거 /profile/로 저장된 값 보정
  if (/^profile\//i.test(path))  return `${API_BASE}/uploads/${path}`.replace('/profile/', '/profile/');
  if (/^\/profile\//i.test(p))   return `${API_BASE}/uploads${p}`;

  // images 등은 그대로
  if (/^(images|uploads\/images|static)\//i.test(path)) return `${API_BASE}/${path}`;

  // 파일명만 온 경우 → uploads/profile/파일명
  return `${API_BASE}/uploads/profile/${path}`;
};
const bust = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();

/* ── API ───────────────────────── */
async function apiFetchPost(id) {
  // 상세는 같은 오리진으로 (세션이 필요할 수도 있으니)
  const { data } = await sameOrigin.get(`/api/posts/detail/${id}`);
  return data;
}
async function apiUpdatePost({ id, title, content, files }) {
  const fd = new FormData();
  fd.append('title', title ?? '');
  fd.append('content', content ?? '');
  (files || []).forEach(f => fd.append('files', f));
  // 업데이트는 8080 직접 호출(권한 정책에 맞게 사용)
  const { data } = await direct8080.put(`/api/posts/modify/${id}`, fd);
  return data;
}

/** ✅ 작성자(User) 조회: /api/posts/author?loginid=... (permitAll) */
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

/* ── styled ────────────────────── */
const PostUpdateStyle = createGlobalStyle`
  .postdetail-article[data-page="edit-post"] { min-height: 681px; }
`;
const PostEditButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;
const Btn = styled.button`
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
`;
const CancelBtn = styled(Btn)`
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
`;
const SubmitBtn = styled(Btn)`
  background: #c7c8cc;
  color: #374151;
  border: none;
  box-shadow: 0 2px 6px rgba(59,130,246,0.35);
`;

/* ── 에디터 유틸 ───────────────── */
const looksLikeHtml = (s = '') => /<\/?[a-z][\s\S]*>/i.test(s);
function toEditableHtml(content = '') {
  if (!content) return '';
  if (looksLikeHtml(content)) return content;
  const ta = document.createElement('textarea');
  ta.innerHTML = content;
  const decoded = ta.value;
  if (looksLikeHtml(decoded)) return decoded;
  return String(content).replace(/\r?\n/g, '<br/>');
}
const hasNonBlobImage = (html = '') =>
  /<img\b[^>]*src=["'](?!blob:)[^"']+["'][^>]*>/i.test(html);
function stripEditArtifacts(html = '') {
  if (!html) return html;
  let out = html.replace(/style="([^"]*)"/gi, (m, styles) => {
    const cleaned = styles
      .replace(/(^|;)\s*outline\s*:[^;"]*;?/gi, '$1')
      .replace(/(^|;)\s*outline-[^:]+:[^;"]*;?/gi, '$1')
      .replace(/;;+/g, ';')
      .replace(/^;|;$/g, '')
      .trim();
    return cleaned ? `style="${cleaned}"` : '';
  });
  out = out.replace(/\sclass="([^"]*)"/gi, (m, cls) => {
    const newCls = cls.split(/\s+/).filter(c => c && c !== 'img-selected').join(' ');
    return newCls ? ` class="${newCls}"` : '';
  });
  return out;
}
function isEmptyContent(html = "") {
  if (!html) return true;
  const hasImage = /<img\b/i.test(html);
  const textOnly = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return !hasImage && textOnly.length === 0;
}
const pad = (n) => String(n).padStart(2, '0');
function formatDateToYYYYMMDD(s) {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
}

/* ── Component ─────────────────── */
export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [title, setTitle] = useState('');
  const [html, setHtml]   = useState('');
  const [files, setFiles] = useState([]);

  const [post, setPost] = useState(null);

  // 작성자 사이드바 (읽기 전용)
  const [author, setAuthor] = useState(null);
  const [authorLoading, setAuthorLoading] = useState(false);
  const [authorError, setAuthorError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        // 1) 글 불러오기
        const data = await apiFetchPost(id);
        setPost(data);

        // 2) 작성자 정보 (✅ loginid 기반 조회)
        const loginid =
          data?.loginid ?? data?.writerLoginId ?? data?.authorLoginId ?? data?.userLoginId ?? null;

        if (loginid) {
          setAuthorLoading(true);
          const u = await fetchAuthorCascade(loginid);
          if (!u) {
            setAuthor(null);
            setAuthorError('작성자 정보를 가져오지 못했습니다.');
          } else {
            setAuthor(u);
          }
        } else {
          setAuthor(null);
          setAuthorError('작성자 로그인 아이디가 없어 사용자 정보를 조회할 수 없습니다.');
        }

        // 3) 에디터 초기화
        const uploaded = [data?.imagepath0, data?.imagepath1, data?.imagepath2, data?.imagepath3, data?.imagepath4].filter(Boolean);
        const base = toEditableHtml(data?.content || '');
        const htmlNoBlob = base.replace(
          /(<img\b[^>]*\bsrc=["'])([^"']+)(["'][^>]*>)/gi,
          (m, p1, src, p3) => {
            if (/^blob:/i.test(src)) return m;
            return `${p1}${bust(toImageSrc(src))}${p3}`;
          }
        );
        const needAppend = !hasNonBlobImage(htmlNoBlob) && uploaded.length > 0;
        const appended = needAppend
          ? htmlNoBlob + uploaded.map(raw =>
              `<p><img src="${bust(toImageSrc(raw))}" style="max-width:100%;height:auto;display:block;margin:8px auto;" /></p>`
            ).join('')
          : htmlNoBlob;

        setTitle(data?.title || '');
        setHtml(stripEditArtifacts(appended));
      } catch {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
        setAuthorLoading(false);
      }
    })();
  }, [id]);

  const handleImageUpload = async (file) => {
    setFiles(prev => [...prev, file]);
    return URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    const t = (title ?? '').trim();
    const cleaned = stripEditArtifacts(html ?? '').trim();
    if (!t) { alert('제목을 입력하세요.'); return; }
    if (isEmptyContent(cleaned)) { alert('내용을 입력하세요.'); return; }

    try {
      setLoading(true);
      await apiUpdatePost({ id, title: t, content: cleaned, files });
      alert('수정되었습니다.');
      navigate(`/postlist/postdetail/${id}`);
    } catch (err) {
      console.error(err);
      alert('수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(`/postlist/postdetail/${id}`);

  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">불러오는 중…</p>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  // 작성자 표시값
  const avatarSrc = bust(toImageSrc(author?.imagePath));
  const email     = (author?.email ?? '').trim() || '(미등록)';
  const phone     = (author?.phone ?? '').trim() || '(미등록)';
  const birthday  = (author?.birthday ? formatDateToYYYYMMDD(author.birthday) : '').trim() || '(미등록)';
  const location  = (author?.location ?? '').trim() || '(미등록)';
  const onAvatarError = (e) => { e.currentTarget.src = DEFAULT_AVATAR; };

  return (
    <>
      <PostUpdateStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* ── 사이드바: 작성자(User) 정보 읽기 전용 ── */}
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
                  {/* 닉네임 있으면 닉네임, 없으면 loginId */}
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

          {/* 본문: 에디터 + 버튼 */}
          <div className="postdetail-main-content">
            <article className="postdetail-article active" data-page="edit-post">
              <form onSubmit={handleSubmit} className="postedit-form">
                <UpdateEditor
                  initialTitle={title}
                  initialHtml={html}
                  onTitleChange={setTitle}
                  onContentChange={setHtml}
                  imageUpload={async (file) => {
                    setFiles(prev => [...prev, file]);
                    return URL.createObjectURL(file);
                  }}
                />
                <div className='butt'>
                  <PostEditButtons>
                    <CancelBtn type="button" onClick={handleCancel}>취소</CancelBtn>
                    <SubmitBtn type="submit" disabled={loading}>
                      {loading ? '저장 중...' : '저장'}
                    </SubmitBtn>
                  </PostEditButtons>
                </div>
              </form>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
