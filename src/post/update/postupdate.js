import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header'; 
import '../post_detail/postdetail.css'; 
import './postupdate.css'; 

// UpdateEditor 컴포넌트 임포트 경로 (같은 폴더 내에 updateeditor.js 파일이 있을 경우)
import UpdateEditor from './updateeditor'; 

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false); // <-- sidebarOpen 상태 유지

  // body에 페이지 특정 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
    };
  }, []);

  // 게시물 데이터 불러오기 (실제 API 호출을 시뮬레이션)
  useEffect(() => {
    if (!id) {
      setError('게시물 ID가 없습니다.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      try {
        const fetchedPost = {
          id: id,
          title: `게시물 ${id}의 제목입니다. (수정 가능)`,
          content: `
            <p>이것은 게시물 ${id}의 내용입니다. 에디터에서 직접 수정해보세요.</p>
            <p><img src="https://i.postimg.cc/6pRT5cXp/image.avif" alt="물총날두" width="300" /></p>
            <p>내용 중간에 이미지를 추가하거나 삭제할 수 있습니다.</p>
            <p><img src="https://i.postimg.cc/3JXZ4X7n/image.jpg" alt="브이날두" width="300" /></p>
            <p>이 에디터는 이미지 크기 조절도 가능합니다.</p>
          `,
        };
        
        setPost(fetchedPost); // post 객체에 초기 데이터 저장
        setLoading(false);
      } catch (err) {
        setError('게시물 불러오기 실패');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  // UpdateEditor에서 제출될 때 호출될 함수
  const handleEditorSubmit = ({ title: submittedTitle, html: submittedHtml }) => {
    setLoading(true);
    setTimeout(() => {
      console.log('게시물 수정 완료:', { id, title: submittedTitle, content: submittedHtml });
      setLoading(false);
      alert('게시물이 성공적으로 수정되었습니다!');
      navigate(`/post/${id}`); 
    }, 1000);
  };

  const handleCancel = () => {
    navigate(`/post/${id}`); 
  };

  // 임시 이미지 업로드 함수 (실제로는 백엔드에 파일 전송 후 URL 반환)
  const mockImageUpload = async (file) => {
    console.log("Mock Image Upload:", file.name, file.type);
    return new Promise(resolve => {
        setTimeout(() => {
            alert(`이미지 ${file.name} 임시 업로드 완료! (실제 저장X)`);
            resolve(URL.createObjectURL(file)); 
        }, 500);
    });
  };

  const toggleSidebar = () => setSidebarOpen(v => !v); // <-- toggleSidebar 함수 유지


  if (loading) {
    return (
      <div className="app-root">
        <Header />
        <main className="postdetail-main">
          <div className="postdetail-main-content">
            <p className="postdetail-h3">게시물을 불러오는 중입니다...</p>
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
            <p className="postdetail-h3">오류: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-root">
      <Header />
      <main className="postdetail-main"> 
        <aside className={`postdetail-sidebar ${sidebarOpen ? 'active' : ''}`} aria-hidden={!sidebarOpen} data-sidebar>
          <div className="postdetail-sidebar-info">
            <figure className="postdetail-avatar-box">
              <img src="https://i.postimg.cc/hP9yPjCQ/image.jpg" alt="avatar"/>
            </figure>

            <div className="postdetail-info-content">
              <h1 className="postdetail-name" title="Richard Hanrick">박명수</h1>
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
                  <a href="mailto:richard@example.com" className="postdetail-contact-link">greatPark@example.com</a>
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
        {/* ===== aside 태그 내용 수정 끝 ===== */}

        <div className="postdetail-main-content">
          <article className="postdetail-article active" data-page="edit-post">
            <header>
              <h2 className="postdetail-h2 postdetail-article-title">게시물 수정</h2>
            </header>
            
            {post && ( // post 데이터가 로드된 후에만 에디터를 렌더링합니다.
              <UpdateEditor
                onSubmit={handleEditorSubmit} // 에디터의 최종 제목과 HTML을 받을 콜백
                initialTitle={post.title} // 불러온 게시물 제목 전달
                initialHtml={post.content} // 불러온 게시물 HTML 내용 전달
                imageUpload={mockImageUpload} // 이미지 업로드 핸들러 전달 (현재는 모의 함수)
              />
            )}
            
            <div className="postedit-buttons">
                {/* submit 버튼은 이제 UpdateEditor 내부에 있습니다. */}
                <button type="button" onClick={handleCancel} className="postedit-btn postedit-btn-cancel" disabled={loading}>
                  취소
                </button>
            </div>
          </article>
        </div>
      </main>
    </div>
  );
}