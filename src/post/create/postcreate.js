// src/post/post_create/PostCreate.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css';
import '../../commonness.css';
import WysiwygPostEditor from './postEditor';
import { createGlobalStyle } from "styled-components";
import axios from "axios";

// axios 인스턴스
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  withCredentials: false,
});

// ── 로컬 API 헬퍼 (axios)
async function apiCreatePost(formData) {
  const { data } = await api.post("/api/posts", formData); // Content-Type 자동
  return data;
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

  // 로그인 연동 전 임시 값
  const [loginid] = useState("demoUser");
  const [nickname] = useState("홀란드");

  const [contactInfo, setContactInfo] = useState({ email:'', phone:'', birthday:'', location:'' });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // 에디터가 넘겨주는 { title, html } 사용
  const handleSubmit = async ({ title: submittedTitle, html: submittedHtml }) => {
    const fd = new FormData();
    fd.append("loginid", loginid);
    fd.append("nickname", nickname);
    fd.append("title", submittedTitle ?? "");
    fd.append("content", submittedHtml ?? "");
    (files || []).forEach(f => fd.append("files", f));

    console.log("FD ENTRIES:", Array.from(fd.entries()));

    await apiCreatePost(fd);
    alert("작성 완료!");
    navigate("/postlist");
  };

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
