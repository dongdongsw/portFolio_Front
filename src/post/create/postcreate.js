import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './postcreate.css';
import PostEditor from "./postEditor";

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function PostCreate() {
  const { id } = useParams(); // optional param
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('about');
  
  /*임시추가*/
  const [showCommentSection, setShowCommentSection] = useState(false); // 초기값은 false로 설정하여 기본적으로 숨김
  const [comments, setComments] = useState([]); // 댓글 데이터 (예시)



  const toggleSidebar = () => setSidebarOpen(v => !v);

  return (
    <div className="app-root">
      <main>
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/JzBWVhW4/my-avatar.png" alt="avatar" width="80" />
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
              <PostEditor/>

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