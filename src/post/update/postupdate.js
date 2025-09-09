import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';
import UpdateEditor from './updateeditor';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

axios.defaults.withCredentials = true;

const DEFAULT_AVATAR = '/default_profile.png';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

const toImageSrc = (p) =>
  !p ? DEFAULT_AVATAR
    : /^https?:\/\//i.test(p) ? p
    : p.startsWith('/') ? API_BASE + p
    : API_BASE + '/' + p;

const bust = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
async function preloadWithRetry(url, tries = 6, delay = 150) {
  for (let i = 0; i < tries; i++) {
    const ok = await new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = url;
    });
    if (ok) return true;
    await sleep(delay);
    delay = Math.round(delay * 1.6);
  }
  return false;
}

/* ── API ───────────────────────── */
async function apiFetchPost(id) {
  const { data } = await api.get(`/api/posts/detail/${id}`);
  return data;
}
async function apiUpdatePost({ id, title, content, files }) {
  const fd = new FormData();
  fd.append('title', title ?? '');
  fd.append('content', content ?? '');
  (files || []).forEach(f => fd.append('files', f));
  const { data } = await api.put(`/api/posts/modify/${id}`, fd);
  return data;
}
async function apiGetSession() {
  const res = await api.get('/api/user/session-info', { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
}
async function apiGetMypageInfo() {
  const res = await api.get("/api/mypage/info", { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
}
async function apiUpdateSession(sessionData) {
  await api.patch("/api/user/session-info", sessionData);
}
async function apiUploadProfileImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post("/api/posts/profile-image", fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: () => true,
  });
  if (res.status === 401) throw Object.assign(new Error("UNAUTHORIZED"), { code: 401 });
  if (res.status !== 200 || !res.data?.imagePath) throw new Error("프로필 이미지 업로드 실패");
  return res.data;
}
async function apiDeleteProfileImage() {
  const res = await api.delete("/api/posts/profile-image", { validateStatus: () => true });
  if (res.status === 401) throw Object.assign(new Error("UNAUTHORIZED"), { code: 401 });
  if (res.status !== 200) throw new Error("프로필 이미지 삭제 실패");
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
const SolidButton = styled.button`
  border: none;
  background: #3b82f6;
  color: white;
  font-size: 13px;
  border-radius: 8px;
  padding: 6px 10px;
  cursor: pointer;
  transition: .15s ease;
  &:hover { filter: brightness(0.95); }
  &:disabled { opacity: .5; cursor: not-allowed; }
`;
const SidebarInput = styled.input`
  border: none;
  background: none;
  color: hsl(0,0%,0%);
  font-size: 15px;
  width: 100%;
  outline: none;

  ${({ $editable }) => $editable && `
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 6px;
    padding: 4px 8px;
  `}
`;
const EditButton = styled.span`
  cursor: pointer;
  color: #3b82f6;
  font-size: 14px;
  font-weight: 500;
  margin-left: 8px;
  &:hover { text-decoration: underline; }
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

/* ── Component ─────────────────── */
export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState('');

  const [title, setTitle] = useState('');
  const [html, setHtml]   = useState('');
  const [files, setFiles] = useState([]);

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [post, setPost] = useState(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  // ── 사이드바(프로필 동일)
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', birthday: '', location: '' });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };
  const [editMode, setEditMode] = useState({ phone: false, birthday: false, location: false });

  const [uploadingProfile, setUploadingProfile] = useState(false);
  const avatarFileRef = useRef(null);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);
  const [currentImagePath, setCurrentImagePath] = useState('');
  const previewURLRef = useRef(null);

  const onAvatarError = (e) => {
    const src = e.currentTarget.src || '';
    if (!src.startsWith('blob:')) e.currentTarget.src = DEFAULT_AVATAR;
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
      if (previewURLRef.current) {
        URL.revokeObjectURL(previewURLRef.current);
        previewURLRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      setLoading(false);
      setLoadingMe(false);
      return;
    }
    (async () => {
      try {
        const [data, meData, mypageData] = await Promise.all([
          apiFetchPost(id),
          apiGetSession(),
          apiGetMypageInfo(),
        ]);
        setPost(data);
        setMe(meData);

        // 사이드바 초기 세팅(create 동일)
        const { phone, birthday, location, imagePath } = meData || {};
        const email = mypageData?.email || '';
        setContactInfo({
          email,
          phone: phone || '',
          birthday: birthday ? new Date(birthday).toISOString().slice(0,10) : '',
          location: location || '',
        });
        setCurrentImagePath(imagePath || '');
        setAvatarSrc(imagePath ? bust(toImageSrc(imagePath)) : DEFAULT_AVATAR);

        // 본문
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
        setLoadingMe(false);
      }
    })();
  }, [id]);

  const postAuthorLoginId =
    post?.loginid ?? post?.writerLoginId ?? post?.authorLoginId ?? post?.userLoginId ?? null;
  const meLoginId = me?.loginid ?? me?.loginId ?? null;
  const isOwner = !!(meLoginId && postAuthorLoginId && meLoginId === postAuthorLoginId);

  useEffect(() => {
    if (!loading && !loadingMe) {
      if (!me) {
        alert('로그인이 필요합니다.');
        navigate(`/postlist/postdetail/${id}`);
        return;
      }
      if (!isOwner) {
        alert('작성자만 수정할 수 있습니다.');
        navigate(`/postlist/postdetail/${id}`);
      }
    }
  }, [loading, loadingMe, me, isOwner, id, navigate]);

  // ── 에디터 이미지(본문)
  const handleImageUpload = async (file) => {
    setFiles(prev => [...prev, file]);
    return URL.createObjectURL(file);
  };

  // ── 프로필: 업로드/삭제 (create와 동일)
  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다.'); e.target.value=''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('이미지는 최대 5MB까지 업로드 가능합니다.'); e.target.value=''; return; }

    const preview = URL.createObjectURL(file);
    previewURLRef.current = preview;
    setAvatarSrc(preview);

    try {
      setUploadingProfile(true);
      const { imagePath } = await apiUploadProfileImage(file);
      setCurrentImagePath(imagePath);

      const serverUrl = bust(toImageSrc(imagePath));
      const ok = await preloadWithRetry(serverUrl, 6, 150);
      if (ok) {
        setAvatarSrc(serverUrl);
        if (previewURLRef.current) { URL.revokeObjectURL(previewURLRef.current); previewURLRef.current = null; }
      }
      await apiUpdateSession({ ...contactInfo, imagePath });
      setMe(prev => ({ ...(prev||{}), imagePath }));
    } catch (err) {
      console.error(err);
      alert(err.code === 401 ? "로그인이 필요합니다." : "프로필 이미지 업로드 중 오류가 발생했습니다.");
      if (err.code === 401) navigate("/login");
      if (previewURLRef.current) { URL.revokeObjectURL(previewURLRef.current); previewURLRef.current = null; }
      setAvatarSrc(DEFAULT_AVATAR);
      setCurrentImagePath('');
    } finally {
      setUploadingProfile(false);
      e.target.value = '';
    }
  };

  const onClearAvatar = async () => {
    if (!window.confirm('프로필 이미지를 기본 이미지로 되돌릴까요?')) return;
    try {
      setUploadingProfile(true);
      await apiDeleteProfileImage();
      setAvatarSrc(DEFAULT_AVATAR);
      setCurrentImagePath('');
      if (previewURLRef.current) { URL.revokeObjectURL(previewURLRef.current); previewURLRef.current = null; }
      await apiUpdateSession({ ...contactInfo, imagePath: '' });
      setMe(prev => ({ ...(prev||{}), imagePath: '' }));
    } catch (err) {
      console.error(err);
      alert(err.code === 401 ? "로그인이 필요합니다." : "프로필 이미지 삭제 중 오류가 발생했습니다.");
      if (err.code === 401) navigate("/login");
    } finally {
      setUploadingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!isOwner) {
      alert('작성자만 수정할 수 있습니다.');
      return;
    }

    const t = (title ?? '').trim();
    const cleaned = stripEditArtifacts(html ?? '').trim();
    if (!t) { alert('제목을 입력하세요.'); return; }
    if (isEmptyContent(cleaned)) { alert('내용을 입력하세요.'); return; }

    try {
      setLoading(true);
      await apiUpdateSession({ ...contactInfo, imagePath: currentImagePath });
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

  if (loading || loadingMe) {
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

  const nickname = me?.nickName ?? me?.nickname ?? '(로그인 필요)';

  return (
    <>
      <PostUpdateStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* ── 사이드바: create와 완전 동일 ── */}
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box" style={{ position:'relative' }}>
                <img src={avatarSrc} alt="avatar" width="80" onError={onAvatarError} />
                {uploadingProfile && (
                  <span style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)', fontSize:12 }}>
                    처리 중…
                  </span>
                )}
              </figure>

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <SolidButton type="button" onClick={() => avatarFileRef.current?.click()} disabled={!me}>
                  이미지 삽입
                </SolidButton>
                <SolidButton type="button" onClick={onClearAvatar} disabled={!me}>
                  기본프로필
                </SolidButton>
                <input
                  ref={avatarFileRef}
                  type="file"
                  accept="image/*"
                  style={{ display:'none' }}
                  onChange={onPickAvatar}
                />
              </div>

              <div className="postdetail-info-content">
                <h1 className="postdetail-name">{nickname}</h1>
                <p className="postdetail-title">Web Developer</p>
              </div>

              <button className="postdetail-info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
                <span>{sidebarOpen ? 'Hide Contacts' : 'Show Contacts'}</span>
                <ion-icon name="chevron-down" aria-hidden="true" />
              </button>
            </div>

            <div className="postdetail-sidebar-info-more">
              <div className="postdetail-separator" />
              <ul className="postdetail-contacts-list">
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="mail-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Email</p>
                    <SidebarInput type="email" name="email" value={contactInfo.email} onChange={handleContactInfoChange} placeholder="이메일" readOnly />
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Phone
                      <EditButton onClick={() => setEditMode(p=>({...p,phone:true}))}>Edit</EditButton>
                    </p>
                    <SidebarInput type="tel" name="phone" value={contactInfo.phone} onChange={handleContactInfoChange} placeholder="전화번호" readOnly={!editMode.phone} $editable={editMode.phone}/>
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Birthday
                      <EditButton onClick={() => setEditMode(p=>({...p,birthday:true}))}>Edit</EditButton>
                    </p>
                    <SidebarInput type="text" name="birthday" value={contactInfo.birthday} onChange={handleContactInfoChange} placeholder="YYYY-MM-DD" readOnly={!editMode.birthday} $editable={editMode.birthday} inputMode="numeric"/>
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Location
                      <EditButton onClick={() => setEditMode(p=>({...p,location:true}))}>Edit</EditButton>
                    </p>
                    <SidebarInput type="text" name="location" value={contactInfo.location} onChange={handleContactInfoChange} placeholder="주소" readOnly={!editMode.location} $editable={editMode.location}/>
                  </div>
                </li>
              </ul>
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
                  imageUpload={handleImageUpload}
                />
                <PostEditButtons>
                  <CancelBtn type="button" onClick={handleCancel}>취소</CancelBtn>
                  <SubmitBtn type="submit" disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </SubmitBtn>
                </PostEditButtons>
              </form>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
