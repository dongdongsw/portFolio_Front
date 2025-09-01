// src/post/post_update/postupdate.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import '../post_detail/postdetail.css'; // 레이아웃/사이드바 스타일 재사용
import UpdateEditor from './updateeditor';
import styled, { createGlobalStyle } from 'styled-components';
import axios from 'axios';

axios.defaults.withCredentials = true;

/* axios 인스턴스 */
const api = axios.create({
  baseURL: process.env.REACT_APP_API_BASE || "",
  withCredentials: false,
});

/* ── 로컬 API 헬퍼 (axios) ─────────────────────────── */
async function apiFetchPost(id) {
  const { data } = await api.get(`/api/posts/detail/${id}`);
  return data;
}
async function apiUpdatePost({ id, title, content, files }) {
  const fd = new FormData();
  fd.append('title', title ?? '');
  fd.append('content', content ?? '');
  (files || []).forEach(f => fd.append('files', f));

  const { data } = await api.put(`/api/posts/modify/${id}`, fd); // 헤더 자동
  return data;
}
/* ─────────────────────────────────────────────────── */

/* ── styled-components ─────────────────────────────── */
const PostUpdateStyle = createGlobalStyle`
  .postdetail-article[data-page="edit-post"] { min-height: 681px; }
`;

const PostEditButtons = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

const Btn = styled.button`
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid #d1d5db;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
`;

const CancelBtn = styled(Btn)`
  background: #f3f4f6;
  color: #374151;
  border-color: #e5e7eb;
`;

const SubmitBtn = styled(Btn)`
  background: #c7c8cc;
  color: #374151;
  border: none;
  box-shadow: 0 2px 6px rgba(59,130,246,0.35);
`;

const SidebarInput = styled.input`
  border: none;
  background: none;
  color: hsl(0,0%,0%);
  font-size: 15px;
  width: 100%;
  outline: none;
`;
/* ─────────────────────────────────────────────────── */

/* ── 유틸 ─────────────────────────────────────────── */
const looksLikeHtml = (s = '') => /<\/?[a-z][\s\S]*>/i.test(s);

function toEditableHtml(content = '') {
  if (!content) return '';
  if (looksLikeHtml(content)) return content;

  const ta = document.createElement('textarea');
  ta.innerHTML = content;
  const decoded = ta.value;
  if (looksLikeHtml(decoded)) return decoded;

  return String(content).replace(/\r?\n/g, '<br/>');
}

function replaceBlobImages(html = '', imagePaths = []) {
  let idx = 0;
  const replaced = html.replace(
    /<img\b[^>]*src=["']blob:[^"']*["'][^>]*>/gi,
    (match) => {
      if (idx >= imagePaths.length) return '';
      const src = imagePaths[idx++];
      return match.replace(/src=["'][^"']+["']/, `src="${src}"`);
    }
  );
  return { html: replaced };
}

const hasNonBlobImage = (html = '') =>
  /<img\b[^>]*src=["'](?!blob:)[^"']+["'][^>]*>/i.test(html);

// 수정 아티팩트 제거(파란 테두리 등)
function stripEditArtifacts(html = '') {
  if (!html) return html;
  let out = html.replace(/style="([^"]*)"/gi, (m, styles) => {
    const cleaned = styles
      .replace(/(^|;)\s*outline\s*:[^;"]*;?/gi, '$1')
      .replace(/(^|;)\s*outline-[^:]+:[^;"]*;?/gi, '$1')
      .replace(/;;+/g, ';')
      .replace(/^;|;$/g, '')
      .trim();
    return cleaned ? `style="${cleaned}"` : '';
  });
  out = out.replace(/\sclass="([^"]*)"/gi, (m, cls) => {
    const newCls = cls.split(/\s+/).filter(c => c && c !== 'img-selected').join(' ');
    return newCls ? ` class="${newCls}"` : '';
  });
  return out;
}

/* ✅ 내용이 비었는지 판정: 텍스트가 없고 이미지(<img>)도 없으면 빈 내용으로 간주 */
function isEmptyContent(html = "") {
  if (!html) return true;
  const hasImage = /<img\b/i.test(html);
  const textOnly = html
    .replace(/<br\s*\/?>/gi, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/<[^>]+>/g, "")
    .trim();
  return !hasImage && textOnly.length === 0;
}
/* ─────────────────────────────────────────────────── */

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState('');

  const [title, setTitle] = useState('');
  const [html, setHtml]   = useState('');
  const [files, setFiles] = useState([]); // 새로 추가되는 파일만

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const toggleSidebar = () => setSidebarOpen(v => !v);
  const [contactInfo, setContactInfo] = useState({ email:'', phone:'', birthday:'', location:'' });
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => document.body.classList.remove('postdetail-body-styles');
  }, []);

  // 기존 글 로드
  useEffect(() => {
    if (!id || isNaN(Number(id))) {
      setError('잘못된 게시글 주소입니다.');
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await apiFetchPost(id);
        const uploadedImages = [
          data?.imagepath0, data?.imagepath1, data?.imagepath2, data?.imagepath3, data?.imagepath4
        ].filter(Boolean);

        const baseHtml = toEditableHtml(data?.content || '');
        const { html: htmlNoBlob } = replaceBlobImages(baseHtml, uploadedImages);

        const needAppend = !hasNonBlobImage(htmlNoBlob) && uploadedImages.length > 0;
        const appendedHtml = needAppend
          ? htmlNoBlob + uploadedImages.map(src =>
              `<p><img src="${src}" style="max-width:100%;height:auto;display:block;margin:8px auto;" /></p>`
            ).join('')
          : htmlNoBlob;

        setTitle(data?.title || '');
        setHtml(stripEditArtifacts(appendedHtml)); // 로드시도 아티팩트 제거
      } catch {
        setError('게시글을 불러오지 못했습니다.');
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const handleImageUpload = async (file) => {
    setFiles(prev => [...prev, file]);
    return URL.createObjectURL(file);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // ✅ 제목/내용 검증 (이미지만 있어도 내용 OK)
    const t = (title ?? '').trim();
    const cleaned = stripEditArtifacts(html ?? '').trim();

    if (!t) {
      alert('제목을 입력하세요.');
      return;
    }
    if (isEmptyContent(cleaned)) {
      alert('내용을 입력하세요.');
      return;
    }

    try {
      setLoading(true);
      await apiUpdatePost({ id, title: t, content: cleaned, files });
      alert('수정되었습니다.');
      navigate(`/postlist/postdetail/${id}`);
    } catch (err) {
      console.error(err);
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
    <>
      <PostUpdateStyle />
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          {/* 사이드바 */}
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
                <h1 className="postdetail-name">박명수</h1>
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
                      className="postdetail-contact-link-input"
                    />
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Phone</p>
                    <SidebarInput
                      type="tel"
                      name="phone"
                      value={contactInfo.phone}
                      onChange={handleContactInfoChange}
                      placeholder="전화번호를 입력하세요"
                      className="postdetail-contact-link-input"
                    />
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="calendar-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Birthday</p>
                    <SidebarInput
                      type="date"
                      name="birthday"
                      value={contactInfo.birthday}
                      onChange={handleContactInfoChange}
                      placeholder="YYYY-MM-DD"
                      className="postdetail-contact-link-input"
                    />
                  </div>
                </li>

                <li className="postdetail-contact-item">
                  <div className="postdetail-icon-box"><ion-icon name="location-outline" aria-hidden="true" /></div>
                  <div className="postdetail-contact-info">
                    <p className="postdetail-contact-title">Location</p>
                    <SidebarInput
                      type="text"
                      name="location"
                      value={contactInfo.location}
                      onChange={handleContactInfoChange}
                      placeholder="주소를 입력하세요"
                      className="postdetail-contact-link-input"
                    />
                  </div>
                </li>
              </ul>
            </div>
          </aside>

          {/* 본문: 에디터 + 버튼 */}
          <div className="postdetail-main-content">
            <article className="postdetail-article active" data-page="edit-post">
              <form onSubmit={handleSubmit} className="postedit-form">
                <UpdateEditor
                  initialTitle={title}
                  initialHtml={html}
                  onTitleChange={setTitle}
                  onContentChange={setHtml}
                  imageUpload={handleImageUpload}
                />

                <PostEditButtons>
                  <CancelBtn type="button" onClick={handleCancel}>취소</CancelBtn>
                  <SubmitBtn type="submit" disabled={loading}>
                    {loading ? '저장 중...' : '저장'}
                  </SubmitBtn>
                </PostEditButtons>
              </form>
            </article>
          </div>
        </main>
      </div>
    </>
  );
}
