// src/post/post_create/PostCreate.jsx
import React, { useEffect, useState } from 'react';
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

const SidebarInput = styled.input`
  border: none;
  background: none;
  color: hsl(0,0%,0%);
  font-size: 15px;
  width: 100%;
  outline: none;

  ${props => props.isEditable && `
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
  &:hover {
    text-decoration: underline;
  }
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

  const [contactInfo, setContactInfo] = useState({ email: '', phone: '', birthday: '', location: '' });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const [editMode, setEditMode] = useState({
    phone: false,
    birthday: false,
    location: false,
  });

  const handleEditClick = (field) => {
    setEditMode(prev => ({ ...prev, [field]: true }));
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  useEffect(() => {
    (async () => {
      try {
        setLoadingMe(true);
        
        const [sessionUser, mypageInfo] = await Promise.all([
          apiGetSession(),
          apiGetMypageInfo()
        ]);

        if (!sessionUser) {
          alert("로그인이 필요합니다.");
          navigate("/login");
          return;
        }

        setMe(sessionUser);
        
        const { phone, birthday, location } = sessionUser;
        const email = mypageInfo?.email || '';

        setContactInfo({
          email,
          phone: phone || '',
          birthday: formatDateToYYYYMMDD(birthday),
          location: location || '',
        });

      } catch (error) {
        console.error("데이터 로딩 중 오류 발생:", error);
        alert("사용자 정보를 불러오는데 실패했습니다.");
      } finally {
        setLoadingMe(false);
      }
    })();
  }, [navigate]);

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

    const nickname = me?.nickName ?? me?.nickname ?? "";
    const loginid = me?.loginid ?? me?.loginId ?? "";

    const fd = new FormData();
    fd.append("loginid", loginid);
    fd.append("nickname", nickname);
    fd.append("title", t);
    fd.append("content", h);
    (files || []).forEach(f => fd.append("files", f));

    try {
      await apiUpdateSession(contactInfo);
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
  const myImage = me?.imagePath ?? "https://i.postimg.cc/hP9yPjCQ/image.jpg";

  return (
    <>
      <EditorStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
            <div className="postdetail-sidebar-info">
              <figure className="postdetail-avatar-box">
                <img src={myImage} alt="avatar" width="80" />
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
                      isEditable={editMode.phone}
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
                      type="date"
                      name="birthday"
                      value={contactInfo.birthday}
                      onChange={handleContactInfoChange}
                      placeholder="YYYY-MM-DD"
                      readOnly={!editMode.birthday}
                      isEditable={editMode.birthday}
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
                      isEditable={editMode.location}
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