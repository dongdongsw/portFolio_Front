// src/post/post_detail/postdetail.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './postdetail.css';
import Header from '../../components/Header';
import { fetchPost, deletePost } from '../../api/postApi';

const pad = (n) => String(n).padStart(2, '0');
function formatDate(v) {
  if (!v) return '';
  const d = new Date(v);
  if (isNaN(d)) return '';
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
const looksLikeHtml = (s='') => /<\/?[a-z][\s\S]*>/i.test(s);

// 평문/이스케이프된 HTML → 렌더 가능한 HTML
function toDisplayHtml(content='') {
  if (!content) return '';
  if (looksLikeHtml(content)) return content;

  const ta = document.createElement('textarea');
  ta.innerHTML = content;
  const decoded = ta.value;
  if (looksLikeHtml(decoded)) return decoded;

  return String(content)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/\r?\n/g,'<br/>');
}

// blob 이미지를 서버 저장 경로로 치환
function replaceBlobImages(html = '', imagePaths = []) {
  let idx = 0;
  const replaced = html.replace(
    /<img\b[^>]*src=["']blob:[^"']*["'][^>]*>/gi,
    (match) => {
      if (idx >= imagePaths.length) return ''; // 더 없으면 해당 blob 이미지는 제거
      const src = imagePaths[idx++];
      return match.replace(/src=["'][^"']+["']/, `src="${src}"`);
    }
  );
  return { html: replaced, usedCount: idx };
}
const hasNonBlobImage = (html='') =>
  /<img\b[^>]*src=["'](?!blob:)[^"']+["'][^>]*>/i.test(html);

export default function PostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [error, setError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      return;
    }
    (async () => {
      try {
        const data = await fetchPost(id);
        setPost(data);
      } catch (e) {
        setError('게시글을 불러오지 못했습니다.');
      }
    })();
  }, [id]);

  const onEdit = () => navigate(`/update/${id}`);
  const onDelete = async () => {
    if (!window.confirm('정말 삭제할까요?')) return;
    try {
      await deletePost(id);
      alert('삭제되었습니다.');
      navigate('/postlist');
    } catch {
      alert('삭제에 실패했습니다.');
    }
  };

  if (error) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">{error}</p>
            <button onClick={() => navigate('/postlist')}>목록으로</button>
          </div>
        </main>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">게시글을 불러오는 중...</p>
          </div>
        </main>
      </div>
    );
  }

  // DTO 매핑
  const title   = post.title || '(제목 없음)';
  const author  = post.nickname || post.loginid || '작성자';

  // ✅ 작성일 / 최종 수정일 계산 (작성일은 uploaddate, 수정일이 있고 서로 다를 때만 표시)
  const uploadStr = formatDate(post.uploaddate);
  const modifyStr =
    post.modifydate &&
    new Date(post.modifydate).getTime() !== new Date(post.uploaddate || 0).getTime()
      ? formatDate(post.modifydate)
      : null;

  const content = post.content || '';

  // 서버 저장 이미지들
  const uploadedImages = [
    post.imagepath0, post.imagepath1, post.imagepath2, post.imagepath3, post.imagepath4
  ].filter(Boolean);

  // 본문 HTML 준비 + blob→서버 경로 치환
  const baseHtml = toDisplayHtml(content);
  const { html: htmlNoBlob } = replaceBlobImages(baseHtml, uploadedImages);

  return (
    <div className="app-root">
      <Header />
      <main className="postdetail-main">
        {/* 사이드바 유지 */}
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar"/>
            </figure>
            <div className="postdetail-info-content">
              <h1 className="postdetail-name" title="Writer">{author}</h1>
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
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/new-post.png" alt="new-post"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Email</p>
                  <a href="#!" className="postdetail-contact-link">greatPark@example.com</a>
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/phone--v1.png" alt="phone--v1"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Phone</p>
                  <a href="#!" className="postdetail-contact-link">+82-10-0000-0000</a>
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/birthday.png" alt="birthday"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Birthday</p>
                  <time dateTime="1982-06-23">June 23, 1982</time>
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/material-sharp/24/marker.png" alt="marker"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Location</p>
                  <address>Seoul, Korea</address>
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* 본문 + 수정/삭제 버튼 */}
        <div className="postdetail-main-content">
          <article className="postdetail-article postdetail-about active" data-page="about">
            <header style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
              <div>
                <h2 className="postdetail-h2 postdetail-article-title" style={{ marginBottom: 6 }}>{title}</h2>
                <p style={{margin: 0, color: '#666'}}>
                  {uploadStr && <> <span>작성일 {uploadStr}</span></>}
                  {modifyStr && <span style={{ color: '#8a8a8a' }}> (최종 수정일: {modifyStr})</span>}
                </p>
              </div>

              {/* 작성/취소 스타일과 동일 */}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={onEdit} style={submitBtnStyle}>수정</button>
                <button onClick={onDelete} style={cancelBtnStyle}>삭제</button>
              </div>
            </header>

            <section className="postdetail-about-text">
              {htmlNoBlob ? (
                <div dangerouslySetInnerHTML={{ __html: htmlNoBlob }} />
              ) : (
                <p>(내용 없음)</p>
              )}
            </section>
          </article>
        </div>
      </main>
    </div>
  );
}

const btnStyle = {
  padding: "10px 14px",
  borderRadius: 12,
  border: "1px solid #d1d5db",
  background: "#fff",
  cursor: "pointer",
  fontSize: 14,
};

const cancelBtnStyle = {
  ...btnStyle,
  background: "#f3f4f6",     // 연한 회색 (취소/삭제)
  color: "#374151",
  borderColor: "#e5e7eb",
};

const submitBtnStyle = {
  ...btnStyle,
  background: "#c7c8cc",     // 작성/수정
  color: "#374151",
  border: "none",
  boxShadow: "0 2px 6px rgba(59,130,246,0.35)",
};
