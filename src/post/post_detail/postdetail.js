import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import './postdetail.css';
import '../../commonness.css';

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function PostDetail() {
  const { id } = useParams(); // optional param
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('about');
  const [testimonialModalOpen, setTestimonialModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [filterValue, setFilterValue] = useState('all');
  const [selectOpen, setSelectOpen] = useState(false);

  const formRef = useRef(null);
  const [isFormValid, setIsFormValid] = useState(false);

  const prefersReduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const lastFocusedRef = useRef(null);




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





  useEffect(() => {
    if (!formRef.current) return;
    const el = formRef.current;
    const handler = () => setIsFormValid(el.checkValidity());
    el.addEventListener('input', handler);
    handler();
    return () => el.removeEventListener('input', handler);
  }, []);

  // // ESC로 모달 닫기
  // useEffect(() => {
  //   const onKey = (e) => {
  //     if (e.key === 'Escape' && testimonialModalOpen) {
  //       closeTestimonialModal();
  //     }
  //   };
  //   document.addEventListener('keydown', onKey);
  //   return () => document.removeEventListener('keydown', onKey);
  // }, [testimonialModalOpen]);

  const toggleSidebar = () => setSidebarOpen(v => !v);

  // const openTestimonialModal = (item, ev) => {
  //   if (ev && ev.preventDefault) ev.preventDefault();
  //   lastFocusedRef.current = document.activeElement;
  //   setModalContent(item);
  //   setTestimonialModalOpen(true);
  // };

  // const closeTestimonialModal = () => {
  //   setTestimonialModalOpen(false);
  //   setModalContent(null);
  //   if (lastFocusedRef.current && lastFocusedRef.current.focus) lastFocusedRef.current.focus();
  // };

  // const handleSelectToggle = () => setSelectOpen(v => !v);
  // const handleSelectItem = (val) => { setFilterValue(val); setSelectOpen(false); };

  // const handleContactSubmit = async (e) => {
  //   e.preventDefault();
  //   const form = formRef.current;
  //   if (!form || !form.checkValidity()) return;
  //   const submitBtn = form.querySelector('[data-form-btn]');
  //   if (submitBtn) submitBtn.setAttribute('disabled', '');

  //   const data = {
  //     fullname: form.fullname.value.trim(),
  //     email: form.email.value.trim(),
  //     message: form.message.value.trim(),
  //   };
  //   try {
  //     const res = await fetch(form.action || '/api/contact', {
  //       method: form.method || 'POST',
  //       headers: { 'Content-Type': 'application/json' },
  //       body: JSON.stringify(data),
  //     });
  //     if (res.ok) {
  //       alert('메시지를 성공적으로 보냈습니다.');
  //       form.reset();
  //     } else {
  //       const txt = await res.text();
  //       alert('전송 실패: ' + txt);
  //     }
  //   } catch (err) {
  //     console.error(err);
  //     alert('네트워크 오류가 발생했습니다.');
  //   } finally {
  //     if (submitBtn) submitBtn.removeAttribute('disabled');
  //   }
  // };

  useEffect(() => {
    if (id) {
      setActivePage('portfolio');
    }
  }, [id]);

  return (
    <div className="app-root">
      <main>
        <aside className={`sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="sidebar-info">
            <figure className="avatar-box">
              <img src="https://i.postimg.cc/JzBWVhW4/my-avatar.png" alt="avatar" width="80" />
            </figure>

            <div className="info-content">
              <h1 className="name" title="Richard Hanrick">Richard Hanrick</h1>
              <p className="title">Web Developer</p>
            </div>

            <button className="info-more-btn" data-sidebar-btn onClick={toggleSidebar} aria-expanded={sidebarOpen}>
              <span>Show Contacts</span>
              <ion-icon name="chevron-down" aria-hidden="true"></ion-icon>
            </button>
          </div>

          <div className="sidebar-info-more">
            <div className="separator" />
            <ul className="contacts-list">
              <li className="contact-item">
                <div className="icon-box"><ion-icon name="mail-outline" aria-hidden="true"></ion-icon></div>
                <div className="contact-info">
                  <p className="contact-title">Email</p>
                  <a href="mailto:richard@example.com" className="contact-link">richard@example.com</a>
                </div>
              </li>

              <li className="contact-item">
                <div className="icon-box"><ion-icon name="phone-portrait-outline" aria-hidden="true"></ion-icon></div>
                <div className="contact-info">
                  <p className="contact-title">Phone</p>
                  <a href="tel:+12133522795" className="contact-link">+1 (213) 352-2795</a>
                </div>
              </li>

              <li className="contact-item">
                <div className="icon-box"><ion-icon name="calendar-outline" aria-hidden="true"></ion-icon></div>
                <div className="contact-info">
                  <p className="contact-title">Birthday</p>
                  <time dateTime="1982-06-23">June 23, 1982</time>
                </div>
              </li>

              <li className="contact-item">
                <div className="icon-box"><ion-icon name="location-outline" aria-hidden="true"></ion-icon></div>
                <div className="contact-info">
                  <p className="contact-title">Location</p>
                  <address>Sacramento, California, USA</address>
                </div>
              </li>
            </ul>

            <div className="separator" />

            <ul className="social-list">
              <li className="social-item"><a href="#" className="social-link" aria-label="Facebook"><ion-icon name="logo-facebook" aria-hidden="true"></ion-icon></a></li>
              <li className="social-item"><a href="#" className="social-link" aria-label="Twitter"><ion-icon name="logo-twitter" aria-hidden="true"></ion-icon></a></li>
              <li className="social-item"><a href="#" className="social-link" aria-label="Instagram"><ion-icon name="logo-instagram" aria-hidden="true"></ion-icon></a></li>
            </ul>
          </div>
        </aside>

        <div className="main-content">


          {/* ABOUT */}
          {activePage === 'about' && (
            <article className="about active" data-page="about">
              <header><h2 className="h2 article-title">About me</h2></header>

              <section className="about-text">
                <p>I'm Creative Director and UI/UX Designer from Sydney, Australia, working in web development and print media. I enjoy turning complex problems into simple, beautiful and intuitive designs.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
              </section>


            </article>
          )}
          {showCommentSection && (
            <section className="comment-section"> {/* 새로운 클래스명 */}
              <h3 className="h3 comment-title">Comments</h3> {/* 댓글 섹션의 제목 */}
              <div className="comments-container"> {/* 댓글이 표시될 실제 공간 */}
                {comments.length > 0 ? (
                  <ul className="comment-list">
                    {comments.map(comment => (
                      <li key={comment.id} className="comment-item">
                        <p className="comment-author">{comment.author}</p>
                        <p className="comment-text">{comment.text}</p>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p>아직 댓글이 없습니다.</p>
                )}
              </div>
              {/* 필요하다면 댓글 입력 폼 추가 가능 */}
              {/*
        <div className="comment-input-area">
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