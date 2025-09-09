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

// 백엔드가 돌려준 상대경로(/profile/..., /images/...) → 절대 URL
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
async function apiGetMypageInfo() {
  const res = await api.get("/api/mypage/info", { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
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
  return res.data; // { imagePath: "/profile/xxx.png" }
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
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/* ------------ Styled UI ------------- */
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

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [files, setFiles] = useState([]);

  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  // 연락처(이메일은 readOnly)
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    birthday: '',
    location: '',
  });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };
  const [editMode, setEditMode] = useState({
    phone: false,
    birthday: false,
    location: false,
  });
  const handleEditClick = (field) => setEditMode(prev => ({ ...prev, [field]: true }));

  // 프로필 업로드/삭제 상태
  const [uploadingProfile, setUploadingProfile] = useState(false);
  const avatarFileRef = useRef(null);
  const [avatarSrc, setAvatarSrc] = useState(DEFAULT_AVATAR);   // 화면 표시용
  const [currentImagePath, setCurrentImagePath] = useState(''); // 서버가 보관하는 imagePath(상대경로)
  const previewURLRef = useRef(null);

  const handleAvatarError = (e) => {
    const src = e.currentTarget.src || '';
    if (!src.startsWith('blob:')) e.currentTarget.src = DEFAULT_AVATAR;
  };

  const onPickAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('이미지 파일만 업로드 가능합니다.'); e.target.value=''; return; }
    if (file.size > 5 * 1024 * 1024) { alert('이미지는 최대 5MB까지 업로드 가능합니다.'); e.target.value=''; return; }

    // 1) 즉시 미리보기
    const preview = URL.createObjectURL(file);
    previewURLRef.current = preview;
    setAvatarSrc(preview);

    try {
      setUploadingProfile(true);
      // 2) 서버 업로드 → imagePath 수신
      const { imagePath } = await apiUploadProfileImage(file); // e.g. "/profile/abc.png"
      setCurrentImagePath(imagePath);

      // 3) 절대 URL + 캐시버스트 후 프리로드 성공 시 교체
      const serverUrl = bust(toImageSrc(imagePath));
      const ok = await preloadWithRetry(serverUrl, 6, 150);
      if (ok) {
        setAvatarSrc(serverUrl);
        if (previewURLRef.current) {
          URL.revokeObjectURL(previewURLRef.current);
          previewURLRef.current = null;
        }
      }
      // 4) 세션(UserEntity) 업데이트에 imagePath도 포함해 저장
      await apiUpdateSession({ ...contactInfo, imagePath });
      setMe(prev => ({ ...(prev||{}), imagePath }));
    } catch (err) {
      console.error(err);
      alert(err.code === 401 ? "로그인이 필요합니다." : "프로필 이미지 업로드 중 오류가 발생했습니다.");
      if (err.code === 401) navigate("/login");
      // 실패 시 미리보기 정리 후 기본 이미지
      if (previewURLRef.current) {
        URL.revokeObjectURL(previewURLRef.current);
        previewURLRef.current = null;
      }
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
      if (previewURLRef.current) {
        URL.revokeObjectURL(previewURLRef.current);
        previewURLRef.current = null;
      }
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
    (async () => {
      try {
        setLoadingMe(true);
        const [sessionUser, mypageInfo] = await Promise.all([
          apiGetSession(),
          apiGetMypageInfo()
        ]);

        if (!sessionUser) { alert("로그인이 필요합니다."); navigate("/login"); return; }

        setMe(sessionUser);

        const { phone, birthday, location, imagePath } = sessionUser;
        const email = mypageInfo?.email || '';
        setContactInfo({
          email,
          phone: phone || '',
          birthday: formatDateToYYYYMMDD(birthday),
          location: location || '',
        });

        // 아바타 초기값(세션값 → 절대URL+버스트)
        setCurrentImagePath(imagePath || '');
        setAvatarSrc(imagePath ? bust(toImageSrc(imagePath)) : DEFAULT_AVATAR);

      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        alert("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [navigate]);

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
      // ⭐ 작성 직전에 imagePath 포함해서 세션(UserEntity) 최종 반영
      await apiUpdateSession({ ...contactInfo, imagePath: currentImagePath });
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

  const nickname = me?.nickName ?? me?.nickname ?? "(알 수 없음)";

  return (
    <>
      <EditorStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box" style={{ position: 'relative' }}>
                <img src={avatarSrc} alt="avatar" width="80" onError={handleAvatarError} />
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
                    <SidebarInput
                      type="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      placeholder="이메일을 입력하세요"
                      readOnly
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Phone
                      <EditButton onClick={() => handleEditClick('phone')}>Edit</EditButton>
                    </p>
                    <SidebarInput
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      placeholder="전화번호를 입력하세요"
                      readOnly={!editMode.phone}
                      $editable={editMode.phone}
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Birthday
                      <EditButton onClick={() => handleEditClick('birthday')}>Edit</EditButton>
                    </p>
                    <SidebarInput
                      type="text"
                      name="birthday"
                      value={contactInfo.birthday}
                      onChange={handleContactInfoChange}
                      placeholder="YYYY-MM-DD"
                      readOnly={!editMode.birthday}
                      $editable={editMode.birthday}
                      inputMode="numeric"
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Location
                      <EditButton onClick={() => handleEditClick('location')}>Edit</EditButton>
                    </p>
                    <SidebarInput
                      type="text"
                      name="location"
                      value={contactInfo.location}
                      onChange={handleContactInfoChange}
                      placeholder="주소를 입력하세요"
                      readOnly={!editMode.location}
                      $editable={editMode.location}
                    />
                  </div>
                </li>
              </ul>
            </div>
          </aside>

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
