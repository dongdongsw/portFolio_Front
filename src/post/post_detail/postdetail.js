import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './postdetail.css';

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function PostDetail() {
  const { id } = useParams(); // optional param
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('about');
  
  /*임시추가*/
  const [showCommentSection, setShowCommentSection] = useState(false); // 초기값은 false로 설정하여 기본적으로 숨김
  const [comments, setComments] = useState([]); // 댓글 데이터 (예시)

  useEffect(() => {
    // 실제 앱에서는 API 호출 등으로 댓글 데이터를 불러옵니다.
    // const fetchedComments = await fetch('/api/comments');
    const sampleComments = [
      { id: 1, author: '유재현', text: '졸려요!' },
      { id: 2, author: '김민석', text: '저희 고생중입니다.' },
    ];
    setComments(sampleComments); // 댓글 데이터를 상태에 저장

    // 댓글 데이터가 있다면 댓글 섹션 보이게 설정
    if (sampleComments.length > 0) {
      setShowCommentSection(true);
    } else {
      setShowCommentSection(false);
    }
  }, []); // 컴포넌트 마운트 시 한 번만 실행

  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="app-root">
      <main>
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/3JXZ4X7n/image.jpg" alt="avatar" width="80"/*작성자 이미지*/ /> 
            </figure>

            <div className="postdetail-info-content">
              <h1 className="postdetail-name" title="Richard Hanrick">Richard Hanrick</h1>
              <p className="postdetail-title">Web Developer</p>
            </div>

            <button className="postdetail-info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
              <span>Show Contacts</span>
              <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
            </button>
          </div>

          <div className="postdetail-sidebar-info-more">
            <div className="postdetail-separator" />
            <ul className="postdetail-contacts-list">
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="mail-outline" aria-hidden="true"></ion-icon></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Email</p>
                  <a href="mailto:richard@example.com" className="postdetail-contact-link">richard@example.com</a>
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true"></ion-icon></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Phone</p>
                  <a href="tel:+12133522795" className="postdetail-contact-link">+1 (213) 352-2795</a>
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true"></ion-icon></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Birthday</p>
                  <time dateTime="1982-06-23">June 23, 1982</time>
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true"></ion-icon></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Location</p>
                  <address>Sacramento, California, USA</address>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        <div className="postdetail-main-content">
          {/* ABOUT */}
          {activePage === 'about' && (
            <article className="postdetail-article postdetail-about active" data-page="about">
              <header><h2 className="postdetail-h2 postdetail-article-title">About me</h2></header>

              <section className="postdetail-about-text">
                <p>I'm Creative Director and UI/UX Designer from Sydney, Australia, working in web development and print media. I enjoy turning complex problems into simple, beautiful and intuitive designs.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <img src="https://i.postimg.cc/3JXZ4X7n/image.jpg" alt="브이날두"  className="postdetail-about-image" />
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <img src="https://i.postimg.cc/6pRT5cXp/image.avif" alt="물총날두"  className="postdetail-about-image" />
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <img src="https://i.postimg.cc/HnCBRBd8/image.jpg" alt="성난날두"  className="postdetail-about-image" />

             
              </section>

            </article>
          )}
          {showCommentSection && (
            <section className="postdetail-comment-section">
              <h3 className="postdetail-h3 postdetail-comment-title">Comments</h3>
              <div className="postdetail-comments-container">
                {comments.length > 0 ? (
                  <ul className="postdetail-comment-list">
                    {comments.map(comment => (
                      <li key={comment.id} className="postdetail-comment-item">
                        <p className="postdetail-comment-author">{comment.author}</p>
                        <p className="postdetail-comment-text">{comment.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 댓글이 없습니다.</p>
                )}
              </div>
              {/* 필요하다면 댓글 입력 폼 추가 가능 */}
              {/*
        <div className="postdetail-comment-input-area">
          <textarea placeholder="댓글을 입력하세요..."></textarea>
          <button>댓글 작성</button>
        </div>
        */}
            </section>
          )}
        </div>
      </main>
    </div>
  );
}