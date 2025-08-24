import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../../components/Header'; 
import '../post_detail/postdetail.css'; 
import './postupdate.css'; 
import UpdateEditor from './updateeditor'; // UpdateEditor 컴포넌트 임포트

export default function PostUpdate() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [sidebarOpen, setSidebarOpen] = useState(false); 

  // 연락처 정보를 관리할 상태
  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    birthday: '', 
    location: '',
  });

  const [currentTitle, setCurrentTitle] = useState(''); // 에디터로부터 받을 현재 제목
  const [currentContent, setCurrentContent] = useState(''); // 에디터로부터 받을 현재 HTML 콘텐츠

  // body에 페이지 특정 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
    };
  }, []);

  // 게시물 데이터 불러오기
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
            <p>가라 물총날두 하이드로펌프!.</p>
            <p><img src="https://i.postimg.cc/3JXZ4X7n/image.jpg" alt="브이날두" width="300" /></p>
            <p>물총날두가 전투에서 승리했다.</p>
          `,
          contact: {
            email: "",
            phone: "",
            birthday: "", 
            location: ""
          }
        };
        
        setPost(fetchedPost); 
        setCurrentTitle(fetchedPost.title); // UpdateEditor의 초기 제목 설정
        setCurrentContent(fetchedPost.content); // UpdateEditor의 초기 내용 설정
        setContactInfo(fetchedPost.contact); 
        setLoading(false);
      } catch (err) {
        setError('게시물 불러오기 실패');
        setLoading(false);
      }
    }, 500);
  }, [id]);

  // 연락처 정보 변경 핸들러 (기존과 동일)
  const handleContactInfoChange = (e) => {
    const { name, value } = e.target;
    setContactInfo(prevInfo => ({
      ...prevInfo,
      [name]: value
    }));
  };

  const handleInputFocus = (e) => {
    const { name, value } = e.target;
    if (post && post.contact && value === post.contact[name]) {
      setContactInfo(prevInfo => ({
        ...prevInfo,
        [name]: ''
      }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    if (value === '' && post && post.contact && post.contact[name]) {
      setContactInfo(prevInfo => ({
        ...prevInfo,
        [name]: post.contact[name]
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault(); // 폼 기본 제출 동작 방지

    setLoading(true);
    // 모든 데이터를 한 번에 수집하여 제출
    const finalData = {
      id,
      title: currentTitle, // UpdateEditor에서 받아온 제목
      content: currentContent, // UpdateEditor에서 받아온 HTML 내용
      contactInfo, // 사이드바 연락처 정보
    };

    setTimeout(() => {
      console.log('게시물 수정 완료:', finalData); 
      setLoading(false);
      alert('게시물이 성공적으로 수정되었습니다!');
      navigate(`/post/${id}`); 
    }, 1000);
  };

  const handleCancel = () => {
    navigate(`/post/${id}`); 
  };

  // 임시 이미지 업로드 함수 (기존과 동일)
  const mockImageUpload = async (file) => {
    console.log("Mock Image Upload:", file.name, file.type);
    return new Promise(resolve => {
        setTimeout(() => {
            alert(`이미지 ${file.name} 임시 업로드 완료! (실제 저장X)`);
            resolve(URL.createObjectURL(file)); 
        }, 500);
    });
  };

  const toggleSidebar = () => setSidebarOpen(v => !v); 


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
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/new-post.png" alt="new-post"/>
                  </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Email</p>
                  <input
                    type="email"
                    name="email"
                    value={contactInfo.email}
                    onChange={handleContactInfoChange}
                    onFocus={handleInputFocus} 
                    onBlur={handleInputBlur}   
                    className="postdetail-contact-link-input"
                    placeholder="이메일을 입력하세요" 
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }} 
                  />
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/phone--v1.png" alt="phone--v1"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Phone</p>
                  <input
                    type="tel"
                    name="phone"
                    value={contactInfo.phone}
                    onChange={handleContactInfoChange}
                    onFocus={handleInputFocus} 
                    onBlur={handleInputBlur}   
                    className="postdetail-contact-link-input"
                    placeholder="전화번호를 입력하세요" 
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/ios-glyphs/30/birthday.png" alt="birthday"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Birthday</p>
                  <input
                    type="date"
                    name="birthday"
                    value={contactInfo.birthday}
                    onChange={handleContactInfoChange}
                    onFocus={handleInputFocus} 
                    onBlur={handleInputBlur}   
                    className="postdetail-contact-link-input"
                    placeholder="YYYY-MM-DD" 
                    style={{ border: 'none', background: 'none', color: 'hsl(0, 0%, 0%)', fontSize: '15px', width: '100%', outline: 'none' }}
                  />
                </div>
              </li>

              <li className="postdetail-contact-item">
                <div className="postdetail-icon-box">
                  <img width="30" height="30" src="https://img.icons8.com/material-sharp/24/marker.png" alt="marker"/>
                </div>
                <div className="postdetail-contact-info">
                  <p className="postdetail-contact-title">Location</p>
                  <input
                    type="text"
                    name="location"
                    value={contactInfo.location}
                    onChange={handleContactInfoChange}
                    onFocus={handleInputFocus} 
                    onBlur={handleInputBlur}   
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
          <article className="postdetail-article active" data-page="edit-post">
            <header>
              <h2 className="postdetail-h2 postdetail-article-title">게시물 수정</h2>
            </header>
            
            <form onSubmit={handleSubmit} className="postedit-form"> 
              {post && ( 
                <UpdateEditor
                  initialTitle={post.title} 
                  initialHtml={post.content} 
                  imageUpload={mockImageUpload}
                  onTitleChange={setCurrentTitle} 
                  onContentChange={setCurrentContent} 
                />
              )}
              
              <div className="postedit-buttons">
                  <button type="submit" className="postedit-btn postedit-btn-save" disabled={loading}>
                    {loading ? '저장 중...' : '등록'}
                  </button>
                  <button type="button" onClick={handleCancel} className="postedit-btn postedit-btn-cancel" disabled={loading}>
                    취소
                  </button>
              </div>
            </form> 

          </article>
        </div>
      </main>
    </div>
  );
}