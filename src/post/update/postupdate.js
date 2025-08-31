// src/post/post_update/postupdate.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css'; // 레이아웃/사이드바 스타일 재사용
import './postupdate.css';              // 있다면 사용
import UpdateEditor from './updateeditor'; // 네가 쓰던 에디터
import { fetchPost, updatePost } from '../../api/postApi';

/** 유틸 */
const looksLikeHtml = (s = '') => /<\/?[a-z][\s\S]*>/i.test(s);

/** 평문이면 간단히 <br/> 변환해서 에디터에 넣을 수 있게 */
function toEditableHtml(content = '') {
  if (!content) return '';
  if (looksLikeHtml(content)) return content;

  // 이스케이프 복원 시도
  const ta = document.createElement('textarea');
  ta.innerHTML = content;
  const decoded = ta.value;
  if (looksLikeHtml(decoded)) return decoded;

  // 평문이면 줄바꿈만 <br/>로
  return String(content).replace(/\r?\n/g, '<br/>');
}

/** 본문 HTML의 blob 이미지를 서버 저장 경로 배열로 순서 치환 */
function replaceBlobImages(html = '', imagePaths = []) {
  let idx = 0;
  const replaced = html.replace(
    /<img\b[^>]*src=["']blob:[^"']*["'][^>]*>/gi,
    (match) => {
      if (idx >= imagePaths.length) {
        // 남는 blob 이미지는 제거(표시 X)
        return '';
      }
      const src = imagePaths[idx++];
      return match.replace(/src=["'][^"']+["']/, `src="${src}"`);
    }
  );
  return { html: replaced, usedCount: idx };
}

/** (blob이 아닌) 실제 이미지가 본문에 있는지 */
const hasNonBlobImage = (html = '') =>
  /<img\b[^>]*src=["'](?!blob:)[^"']+["'][^>]*>/i.test(html);

/** ✅ 수정 아티팩트 제거: outline 스타일/클래스(img-selected 등) 삭제 */
function stripEditArtifacts(html = "") {
  if (!html) return html;

  // style="..." 안의 outline 관련 속성 제거
  let out = html.replace(/style="([^"]*)"/gi, (m, styles) => {
    const cleaned = styles
      .replace(/(^|;)\s*outline\s*:[^;"]*;?/gi, "$1")
      .replace(/(^|;)\s*outline-[^:]+:[^;"]*;?/gi, "$1")
      .replace(/;;+/g, ";")
      .replace(/^;|;$/g, "")
      .trim();
    return cleaned ? `style="${cleaned}"` : "";
  });

  // class="..." 안의 선택 표시 클래스 제거 (img-selected 등)
  out = out.replace(/\sclass="([^"]*)"/gi, (m, cls) => {
    const newCls = cls
      .split(/\s+/)
      .filter(c => c && c !== "img-selected")
      .join(" ");
    return newCls ? ` class="${newCls}"` : "";
  });

  return out;
}

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  // 에디터 바인딩 값
  const [title, setTitle] = useState('');
  const [html, setHtml]   = useState('');
  const [files, setFiles] = useState([]); // 수정 중 새로 추가하는 이미지 파일만 모음

  // 사이드바 UI (서버 전송 X)
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);
  const [contactInfo, setContactInfo] = useState({
    email: '', phone: '', birthday: '', location: '',
  });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };
  const sidebarInputStyle = {
    border: 'none', background: 'none', color: 'hsl(0,0%,0%)',
    fontSize: '15px', width: '100%', outline: 'none',
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // 기존 글 불러오기 + 이미지 치환/보강
  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await fetchPost(id); // GET /api/posts/detail/:id

        const uploadedImages = [
          data?.imagepath0, data?.imagepath1, data?.imagepath2, data?.imagepath3, data?.imagepath4
        ].filter(Boolean);

        const baseHtml = toEditableHtml(data?.content || '');
        const { html: htmlNoBlob } = replaceBlobImages(baseHtml, uploadedImages);

        // 본문에 (blob 아닌) 이미지가 하나도 없고, 서버 저장 이미지가 있으면 본문 끝에 삽입
        const needAppend = !hasNonBlobImage(htmlNoBlob) && uploadedImages.length > 0;
        const appendedHtml = needAppend
          ? htmlNoBlob + uploadedImages.map(src => `<p><img src="${src}" style="max-width:100%;height:auto;display:block;margin:8px auto;" /></p>`).join('')
          : htmlNoBlob;

        setTitle(data?.title || '');
        // ✅ 로드 시점에도 혹시 저장돼 있던 테두리 흔적 제거
        setHtml(stripEditArtifacts(appendedHtml));
      } catch {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  /** 에디터 이미지 업로드: 새 파일만 모아두고 미리보기 URL 반환 */
  const handleImageUpload = async (file) => {
    setFiles(prev => [...prev, file]);
    return URL.createObjectURL(file); // 미리보기
  };

  /** 저장(수정) */
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    try {
      setLoading(true);
      // ✅ 저장 직전 outline/선택 클래스 완전 제거
      const cleaned = stripEditArtifacts(html);
      await updatePost({ id, title, content: cleaned, files }); // PUT /api/posts/modify/:id
      alert('수정되었습니다.');
      navigate(`/postlist/postdetail/${id}`);
    } catch {
      alert('수정에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => navigate(`/postlist/postdetail/${id}`);

  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">불러오는 중…</p>
          </div>
        </main>
      </div>
    );
  }
  if (error) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">{error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />
      <main className="postdetail-main">
        {/* 사이드바 UI 유지 */}
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar" width="80" />
            </figure>
            <div className="postdetail-info-content">
              <h1 className="postdetail-name">박명수</h1>
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
                  <input type="email" name="email" value={contactInfo.email}
                    onChange={handleContactInfoChange} className="postdetail-contact-link-input"
                    placeholder="이메일을 입력하세요" style={sidebarInputStyle} />
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true" /></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Phone</p>
                  <input type="tel" name="phone" value={contactInfo.phone}
                    onChange={handleContactInfoChange} className="postdetail-contact-link-input"
                    placeholder="전화번호를 입력하세요" style={sidebarInputStyle} />
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true" /></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Birthday</p>
                  <input type="date" name="birthday" value={contactInfo.birthday}
                    onChange={handleContactInfoChange} className="postdetail-contact-link-input"
                    placeholder="YYYY-MM-DD" style={sidebarInputStyle} />
                </div>
              </li>
              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true" /></div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Location</p>
                  <input type="text" name="location" value={contactInfo.location}
                    onChange={handleContactInfoChange} className="postdetail-contact-link-input"
                    placeholder="주소를 입력하세요" style={sidebarInputStyle} />
                </div>
              </li>
            </ul>
          </div>
        </aside>

        {/* 본문: 에디터 + 버튼 (작성/취소와 동일 스타일) */}
        <div className="postdetail-main-content">
          <article className="postdetail-article active" data-page="edit-post">
            <header>
              <h2 className="postdetail-h2 postdetail-article-title">게시물 수정</h2>
            </header>

            <form onSubmit={handleSubmit} className="postedit-form">
              <UpdateEditor
                initialTitle={title}
                initialHtml={html}
                onTitleChange={setTitle}
                onContentChange={setHtml}
                imageUpload={handleImageUpload}
              />

              <div className="postedit-buttons" style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
                <button type="button" onClick={handleCancel} style={cancelBtnStyle}>취소</button>
                <button type="submit" style={submitBtnStyle} disabled={loading}>
                  {loading ? '저장 중...' : '저장'}
                </button>
              </div>
            </form>
          </article>
        </div>
      </main>
    </div>
  );
}

/** 버튼 스타일: 작성/취소와 동일 */
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
  background: "#f3f4f6",
  color: "#374151",
  borderColor: "#e5e7eb",
};
const submitBtnStyle = {
  ...btnStyle,
  background: "#c7c8cc",
  color: "#374151",
  border: "none",
  boxShadow: "0 2px 6px rgba(59,130,246,0.35)",
};
