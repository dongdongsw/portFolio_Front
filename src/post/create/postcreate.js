// src/post/post_create/PostCreate.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';   // 사이드바/레이아웃 스타일 재사용
import '../../commonness.css';
import WysiwygPostEditor from './postEditor';
import { createGlobalStyle } from "styled-components";
import { createPost } from '../../api/postApi'; // 이 함수가 FormData를 그대로 보내도록 구현되어 있어야 함 (headers 직접 지정 X)

export default function PostCreate() {
  const navigate = useNavigate();

  const EditorStyle = createGlobalStyle`
    .postdetail-article.active { min-height: 681px; }
  `;

  // 사이드바 열림 (기존 유지: false)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  // 에디터 값 (화면 표시/미러링용)
  const [title, setTitle] = useState("");
  const [html, setHtml] = useState("");
  const [files, setFiles] = useState([]);

  // 로그인 연동 전 임시 값
  const [loginid] = useState("demoUser");
  const [nickname] = useState("홀란드");

  // 사이드바 자기 정보 (UI용; 서버 전송 X)
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

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // 🔴 중요: 에디터가 넘겨주는 { title, html }를 "파라미터"로 받아서 사용!
  const handleSubmit = async ({ title: submittedTitle, html: submittedHtml }) => {
    // FormData 구성 (DTO 필드명과 100% 동일)
    const fd = new FormData();
    fd.append("loginid", loginid);
    fd.append("nickname", nickname);
    fd.append("title", submittedTitle ?? "");
    fd.append("content", submittedHtml ?? "");
    (files || []).forEach(f => fd.append("files", f)); // 파일은 "files"

    // 디버그: 실제 담긴 값 확인
    console.log("FD ENTRIES:", Array.from(fd.entries()));

    // 전송: createPost가 FormData를 그대로 보내도록 구현되어 있어야 함
    //  - 절대 'Content-Type: application/json' 같은 헤더를 강제로 넣지 말 것
    //  - axios는 FormData면 boundary 포함하여 자동으로 헤더 채움
    await createPost(fd);

    alert("작성 완료!");
    navigate("/postlist");
  };

  return (
    <>
      <EditorStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* 🔹 왼쪽 사이드바 (자기 정보 입력) */}
          <aside
            className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`}
            aria-hidden={!sidebarOpen}
            data-sidebar
          >
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box">
                <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar" width="80" />
              </figure>

              <div className="postdetail-info-content">
                <h1 className="postdetail-name">{nickname}</h1>
                <p className="postdetail-title">Web Developer</p>
              </div>

              <button
                className="postdetail-info-more-btn"
                data-sidebar-btn
                onClick={toggleSidebar}
                aria-expanded={sidebarOpen}
              >
                <span>Show Contacts</span>
                <ion-icon name="chevron-down" aria-hidden="true" />
              </button>
            </div>

            <div className="postdetail-sidebar-info-more">
              <div className="postdetail-separator" />
              <ul className="postdetail-contacts-list">
                {/* Email */}
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box">
                    <ion-icon name="mail-outline" aria-hidden="true" />
                  </div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Email</p>
                    <input
                      type="email"
                      name="email"
                      value={contactInfo.email}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="이메일을 입력하세요"
                      style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </li>

                {/* Phone */}
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box">
                    <ion-icon name="phone-portrait-outline" aria-hidden="true" />
                  </div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Phone</p>
                    <input
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="전화번호를 입력하세요"
                      style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </li>

                {/* Birthday */}
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box">
                    <ion-icon name="calendar-outline" aria-hidden="true" />
                  </div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Birthday</p>
                    <input
                      type="date"
                      name="birthday"
                      value={contactInfo.birthday}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="YYYY-MM-DD"
                      style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </li>

                {/* Location */}
                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box">
                    <ion-icon name="location-outline" aria-hidden="true" />
                  </div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Location</p>
                    <input
                      type="text"
                      name="location"
                      value={contactInfo.location}
                      onChange={handleContactInfoChange}
                      className="postdetail-contact-link-input"
                      placeholder="주소를 입력하세요"
                      style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                    />
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* 🔹 우측 본문 (에디터 + 등록 버튼) */}
          <div className="postdetail-main-content">
            <article className="postdetail-article postdetail-about active" data-page="about">
              <section className="postdetail-about-text">
                <WysiwygPostEditor
                  onSubmit={handleSubmit}                    // ✅ 에디터가 { title, html } 넘김
                  placeholderTitle="제목을 입력하세요"
                  placeholderBody="내용을 입력하세요"
                  imageUpload={async (file) => {
                    // 에디터에서 추가한 이미지는 미리보기 URL을 먼저 쓰고, 실제 파일은 files에 보관
                    setFiles(prev => [...prev, file]);
                    return URL.createObjectURL(file);
                  }}
                  onTitleChange={setTitle}                   // (선택) 화면 미러링
                  onContentChange={setHtml}                  // (선택) 화면 미러링
                />
              </section>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
