import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import '../post_detail/postdetail.css';
import '../../commonness.css'; // commonness.css는 그대로 유지
import Header from '../../components/Header';
import WysiwygPostEditor from './postEditor';
import { createGlobalStyle } from "styled-components";

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function PostCreate() {
  const EditorStyle = createGlobalStyle`
  .postdetail-article.active {
    
    min-height: 681px;
  `;

  const { id } = useParams(); // optional param
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('about');
  
  const [showCommentSection, setShowCommentSection] = useState(false); // 초기값은 false로 설정하여 기본적으로 숨김
  const [comments, setComments] = useState([]); // 댓글 데이터 (예시)

  // ✅ 사이드바 연락처 입력 상태 (추가)
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    birthday: '',
    location: '',
  });

  // 페이지 마운트/언마운트 시 body에 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
    };
  }, []);

  const toggleSidebar = () => setSidebarOpen(v => !v);

  useEffect(() => {
    if (id) {
      setActivePage('portfolio'); // id가 있을 경우 portfolio 페이지 활성화 (현재 JSX에 portfolio 관련 section은 없지만 로직은 유지)
    }
  }, [id]);

  // ✅ 사이드바 입력 변경 핸들러 (추가)
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  return (
    <>
    <EditorStyle />
    <div className="app-root">
       <Header />
      <main className="postdetail-main"> 
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar" width="80" />
            </figure>

            <div className="postdetail-info-content">
              <h1 className="postdetail-name" title="Richard Hanrick">Richard Hanrick</h1>
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
              {/* ✅ Email (링크 → 입력창) */}
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
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>

              {/* ✅ Phone */}
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
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>

              {/* ✅ Birthday */}
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
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>

              {/* ✅ Location */}
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
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <div className="postdetail-main-content">
          {/* ABOUT */}
          {activePage === 'about' && (
            <article className="postdetail-article postdetail-about active" data-page="about">

              <section className="postdetail-about-text">                
                <WysiwygPostEditor/>  
              
              </section>
              
            </article>
          )}
         
        </div>
      </main>
    </div>
    </>
  );
}
