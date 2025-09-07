// src/post/post_create/PostCreate.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';
import '../../commonness.css';
import WysiwygPostEditor from './postEditor';
import { createGlobalStyle } from "styled-components";
import axios from "axios";

axios.defaults.withCredentials = true;

// axios 인스턴스 (✅ 세션 쿠키 포함)
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  withCredentials: true,
});

// ── 로컬 API 헬퍼 (axios)
async function apiCreatePost(formData) {
  const { data } = await api.post("/api/posts", formData); // Content-Type 자동
  return data;
}
async function apiGetSession() {
  const res = await api.get("/api/user/session-info", { validateStatus: () => true });
  return res.status === 200 ? res.data : null;
}

// ✅ 내용 비었는지 판정: 텍스트가 없고 이미지(<img>)도 없으면 빈 내용
function isEmptyContent(html = "") {
  const hasImage = /<img\b/i.test(html);
  const textOnly = html
    .replace(/<br\s*\/?>/gi, "")    // <br> 제거
    .replace(/&nbsp;/gi, " ")       // &nbsp;를 공백으로
    .replace(/<[^>]+>/g, "")        // 태그 제거
    .trim();
  return !hasImage && textOnly.length === 0;
}

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

  // ✅ 세션 사용자
  const [me, setMe] = useState(null);
  const [loadingMe, setLoadingMe] = useState(true);

  const [contactInfo, setContactInfo] = useState({ email:'', phone:'', birthday:'', location:'' });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // ✅ 세션 로드
  useEffect(() => {
    (async () => {
      const user = await apiGetSession();
      if (!user) {
        alert("로그인이 필요합니다.");
        // 필요하면 로그인 페이지로 보내기
        // navigate("/login");
      }
      setMe(user);
      setLoadingMe(false);
    })();
  }, [navigate]);

  // ✅ 에디터가 넘겨주는 { title, html } 사용 + 빈 값 검증
  const handleSubmit = async ({ title: submittedTitle, html: submittedHtml }) => {
    if (!me) {
      alert("로그인이 필요합니다.");
      return;
    }

    const t = (submittedTitle ?? "").trim();
    const h = (submittedHtml ?? "").trim();

    if (!t) {
      alert("제목을 입력하세요.");
      return;
    }
    if (isEmptyContent(h)) {
      alert("내용을 입력하세요.");
      return;
    }

    // ⬇️ 서버가 세션에서 작성자 정보를 셋팅하도록 하는 게 가장 안전하지만,
    // 만약 현재 백엔드가 nickname/loginid를 바디에서 기대한다면 세션 값으로 넣어줍니다.
    const nickname = me?.nickName ?? me?.nickname ?? ""; // 백엔드 DTO: UserLoginResponseDto.nickName
    const loginid = me?.loginid ?? me?.loginId ?? "";

    const fd = new FormData();
    // 서버가 세션으로 처리한다면 아래 두 줄은 주석 처리해도 됨
    fd.append("loginid", loginid);
    fd.append("nickname", nickname);

    fd.append("title", t);
    fd.append("content", h);
    (files || []).forEach(f => fd.append("files", f));

    try {
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
          {/* 사이드바 */}
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box">
                <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar" width="80" />
              </figure>

              <div className="postdetail-info-content">
                {/* ✅ 세션 닉네임 사용: '홀란드' 제거 */}
                <h1 className="postdetail-name">{nickname}</h1>
                <p className="postdetail-title">Web Developer</p>
              </div>

              <button className="postdetail-info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
                <span>Show Contacts</span>
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
                    <input
                      type="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="이메일을 입력하세요"
                      style={{ border:'none', background:'none', color:'hsl(0,0%,0%)', fontSize:'15px', width:'100%', outline:'none' }}
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Phone</p>
                    <input
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="전화번호를 입력하세요"
                      style={{ border:'none', background:'none', color:'hsl(0,0%,0%)', fontSize:'15px', width:'100%', outline:'none' }}
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Birthday</p>
                    <input
                      type="date"
                      name="birthday"
                      value={contactInfo.birthday}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="YYYY-MM-DD"
                      style={{ border:'none', background:'none', color:'hsl(0,0%,0%)', fontSize:'15px', width:'100%', outline:'none' }}
                    />
                  </div>
                </li>
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Location</p>
                    <input
                      type="text"
                      name="location"
                      value={contactInfo.location}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="주소를 입력하세요"
                      style={{ border:'none', background:'none', color:'hsl(0,0%,0%)', fontSize:'15px', width:'100%', outline:'none' }}
                    />
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* 본문 */}
          <div className="postdetail-main-content">
            <article className="postdetail-article postdetail-about active" data-page="about">
              <section className="postdetail-about-text">
                <WysiwygPostEditor
                  onSubmit={handleSubmit}
                  placeholderTitle="제목을 입력하세요"
                  placeholderBody="내용을 입력하세요"
                  imageUpload={async (file) => {
                    setFiles(prev => [...prev, file]);      // 실제 파일 모으기
                    return URL.createObjectURL(file);       // 미리보기 URL
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
