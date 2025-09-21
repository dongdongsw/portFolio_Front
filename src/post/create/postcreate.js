// src/post/post_create/PostCreate.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';
import '../../commonness.css';
import WysiwygPostEditor from './postEditor';
import styled, { createGlobalStyle } from "styled-components";
import axios from "axios";

axios.defaults.withCredentials = true;

const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  withCredentials: true,
});

const DEFAULT_AVATAR = '/default_profile.png';
const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:8080';

// 서버 경로를 안전하게 절대 URL로 변환
const toImageSrc = (p) => (!p ? DEFAULT_AVATAR
  : /^https?:\/\//i.test(p) ? p
  : p.startsWith('/') ? API_BASE + p
  : API_BASE + '/' + p);

// 캐시 버스팅
const bust = (url) => url + (url.includes('?') ? '&' : '?') + 'v=' + Date.now();

// 짧게 프리로드(업로드 직후 404 타이밍 회피)
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

/* ---------------- API ---------------- */
async function apiCreatePost(formData) {
  const { data } = await api.post("/api/posts", formData);
  return data;
}
async function apiGetSession() {
  const res = await api.get("/api/user/session-info", { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
}
// ✅ author(작성자) 정보: USER 테이블에서 "loginid"로 조회
async function apiGetAuthorByLoginid(loginid) {
  const res = await api.get(`/api/posts/author?loginid=${encodeURIComponent(loginid)}`, { validateStatus: () => true });
  if (res.status >= 200 && res.status < 300) return res.data;
  return null;
}
async function apiUpdateSession(sessionData) {
  await api.patch("/api/user/session-info", sessionData);
}
/* 프로필 업로드/삭제 */
async function apiUploadProfileImage(file) {
  const fd = new FormData();
  fd.append('file', file);
  const res = await api.post("/api/posts/profile-image", fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
    validateStatus: () => true,
  });
  if (res.status === 401) throw Object.assign(new Error("UNAUTHORIZED"), { code: 401 });
  if (res.status !== 200 || !res.data?.imagePath) throw new Error("프로필 이미지 업로드 실패");
  return res.data; // { imagePath: "/uploads/profile/xxx.png" }
}
async function apiDeleteProfileImage() {
  const res = await api.delete("/api/posts/profile-image", { validateStatus: () => true });
  if (res.status === 401) throw Object.assign(new Error("UNAUTHORIZED"), { code: 401 });
  if (res.status !== 200) throw new Error("프로필 이미지 삭제 실패");
}

/* --------------- Utils --------------- */
function isEmptyContent(html = "") {
  const hasImage = /<img\b/i.test(html);
  const textOnly = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return !hasImage && textOnly.length === 0;
}
function formatDateToYYYYMMDD(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/* ------------ Styled UI ------------- */
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

export default function PostCreate() {
  const navigate = useNavigate();

  const EditorStyle = createGlobalStyle`
    .postdetail-article.active { min-height: 681px; }
  `;

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [files, setFiles] = useState([]);

  // 세션 사용자
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  // 출력 전용: 작성자(USER) 정보
  const [author, setAuthor] = useState(null); // {nickname,email,phone,birthday,location,imagePath}
  const [authorError, setAuthorError] = useState('');
  const [authorLoading, setAuthorLoading] = useState(false);

  // 프로필 업로드/삭제 상태(선택)
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const avatarFileRef = useRef(null);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);   // 화면 표시용
  const [currentImagePath, setCurrentImagePath] = useState(''); // 서버가 보관하는 imagePath
  const previewURLRef = useRef(null);

  const handleAvatarError = (e) => {
    const src = e.currentTarget.src || '';
    if (!src.startsWith('blob:')) e.currentTarget.src = DEFAULT_AVATAR;
  };

  // 글작성 화면 진입 시: 세션 + 작성자(USER) 정보 로드
  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        const sessionUser = await apiGetSession();
        if (!sessionUser) { alert("로그인이 필요합니다."); navigate("/login"); return; }
        setMe(sessionUser);

        // ✅ 로그인 아이디로 USER 조회
        const loginid = sessionUser?.loginid ?? sessionUser?.loginId;
        if (!loginid) {
          setAuthor(null);
          setAuthorError('로그인 아이디가 없어 사용자 정보를 조회할 수 없습니다.');
        } else {
          setAuthorLoading(true);
          const user = await apiGetAuthorByLoginid(loginid);
          if (user) {
            setAuthor({
              nickname: user.nickName ?? user.nickname ?? (sessionUser?.nickName ?? sessionUser?.nickname ?? ''),
              email: user.email ?? '',
              phone: user.phone ?? '',
              birthday: user.birthday ?? '',
              location: user.location ?? '',
              imagePath: user.imagePath ?? user.imagepath ?? '',
            });
            // 아바타 초기값: USER.imagePath 우선 → 세션.imagePath → 기본
            const raw = (user.imagePath ?? user.imagepath) || (sessionUser.imagePath ?? sessionUser.imagepath) || '';
            setCurrentImagePath(raw || '');
            setAvatarSrc(raw ? bust(toImageSrc(raw)) : DEFAULT_AVATAR);
          } else {
            setAuthor(null);
            setAuthorError('사용자 정보를 가져오지 못했습니다.');
            // 세션 이미지로라도 표시
            const raw = sessionUser?.imagePath ?? sessionUser?.imagepath ?? '';
            setCurrentImagePath(raw || '');
            setAvatarSrc(raw ? bust(toImageSrc(raw)) : DEFAULT_AVATAR);
          }
        }
      } catch (error) {
        console.error("데이터 로딩 중 오류:", error);
        alert("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setAuthorLoading(false);
        setLoadingMe(false);
      }
    })();

    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
      if (previewURLRef.current) { URL.revokeObjectURL(previewURLRef.current); previewURLRef.current = null; }
    };
  }, [navigate]);

  // 프로필 업로드(선택 기능 유지)
  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다.'); e.target.value=''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('이미지는 최대 5MB까지 업로드 가능합니다.'); e.target.value=''; return; }

    // 미리보기
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

      // 세션(UserEntity) 업데이트 (작성 전 최신 반영용)
      await apiUpdateSession({ imagePath });
      setMe(prev => ({ ...(prev||{}), imagePath }));
      // author에도 반영
      setAuthor(prev => prev ? ({ ...prev, imagePath }) : prev);
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


  const handleSubmit = async ({ title: submittedTitle, html: submittedHtml }) => {
    if (!me) { alert("로그인이 필요합니다."); return; }

    const t = (submittedTitle ?? "").trim();
    const h = (submittedHtml ?? "").trim();
    if (!t) { alert("제목을 입력하세요."); return; }
    if (isEmptyContent(h)) { alert("내용을 입력하세요."); return; }

    const nickname = me?.nickName ?? me?.nickname ?? "";
    const loginid = me?.loginid ?? me?.loginId ?? "";

    const fd = new FormData();
    fd.append("loginid", loginid);
    fd.append("nickname", nickname);
    fd.append("title", t);
    fd.append("content", h);
    (files || []).forEach(f => fd.append("files", f));

    try {
      // 작성 직전 세션(UserEntity) 최신 이미지 반영
      await apiUpdateSession({ imagePath: currentImagePath });
      await apiCreatePost(fd);
      alert("작성 완료!");
      navigate("/postlist");
    } catch (err) {
      console.error(err);
      alert("작성 중 오류가 발생했습니다.");
    }
  };

  if (loadingMe) {
    return (
      <>
        <EditorStyle />
        <div className="app-root">
          <Header />
          <main className="postdetail-main">
            <div className="postdetail-main-content">
              <p className="postdetail-h3">세션을 확인하는 중...</p>
            </div>
          </main>
        </div>
      </>
    );
  }

  const nickname = author?.nickname ?? me?.nickName ?? me?.nickname ?? "(알 수 없음)";
  const email    = (author?.email ?? '').trim() || '(미등록)';
  const phone    = (author?.phone ?? '').trim() || '(미등록)';
  const birthday = (author?.birthday ? formatDateToYYYYMMDD(author.birthday) : '').trim() || '(미등록)';
  const location = (author?.location ?? '').trim() || '(미등록)';

  return (
    <>
      <EditorStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* 사이드바: USER 테이블 값 "출력 전용" */}
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box" style={{ position: 'relative' }}>
                {authorLoading ? (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee' }} />
                ) : (
                  <img src={bust(toImageSrc(author?.imagePath ?? (me?.imagePath ?? me?.imagepath ?? '')))} alt="avatar" width="80" onError={handleAvatarError} />
                )}
                {uploadingProfile && (
                  <span style={{ position:'absolute', bottom:-6, left:'50%', transform:'translateX(-50%)', fontSize:12 }}>
                    처리 중…
                  </span>
                )}
              </figure>

              <div className="postdetail-info-content">
                <h1 className="postdetail-name">{nickname}</h1>
                <p className="postdetail-title">Author</p>
              </div>

              <button className="postdetail-info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
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

          {/* 본문 */}
          <div className="postdetail-main-content">
            <article className="postdetail-article active" data-page="about">
              <section className="postdetail-about-text">
                <WysiwygPostEditor
                  onSubmit={handleSubmit}
                  placeholderTitle="제목을 입력하세요"
                  placeholderBody="내용을 입력하세요"
                  imageUpload={async (file) => {
                    setFiles(prev => [...prev, file]);
                    return URL.createObjectURL(file);
                  }}
                  onTitleChange={setTitle}
                  onContentChange={setHtml}
                />
              </section>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
