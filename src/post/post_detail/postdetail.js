import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './postdetail.css';
import '../../commonness.css'; // commonness.css는 그대로 유지
import Header from '../../components/Header';

function normalize(s) {
  return String(s || '').trim().toLowerCase();
}

export default function PostDetail() {
  const { id } = useParams(); // optional param
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activePage, setActivePage] = useState('about');
  
  const [showCommentSection, setShowCommentSection] = useState(false); // 초기값은 false로 설정하여 기본적으로 숨김
  const [comments, setComments] = useState([]); // 댓글 데이터 (예시)

  // 페이지 마운트/언마운트 시 body에 클래스 추가/제거
  useEffect(() => {
    document.body.classList.add('postdetail-body-styles');
    return () => {
      document.body.classList.remove('postdetail-body-styles');
    };
  }, []);

  useEffect(() => {
    // 실제 앱에서는 API 호출 등으로 댓글 데이터를 불러옵니다.
    // const fetchedComments = await fetch('/api/comments');
    const sampleComments = [
      { id: 1, author: '유재현', text: '신갓두!' },
      { id: 2, author: '김민석', text: '물총 날두 멋있다....' },
      { id: 3, author: '이철우', text: '날두 꿀밤 때려주고싶다' },
      { id: 4, author: '펩 과르디올라', text: '몰락하는 올드트래프트, 살아나는 에티하드 스타디움' },
      { id: 5, author: '후벵 아모림', text: '아 몰라 망했쩌 오또케오또케' }
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

  useEffect(() => {
    if (id) {
      setActivePage('portfolio'); // id가 있을 경우 portfolio 페이지 활성화 (현재 JSX에 portfolio 관련 section은 없지만 로직은 유지)
    }
  }, [id]);

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

        <div className="postdetail-main-content">
          {/* ABOUT */}
          {activePage === 'about' && (
            <article className="postdetail-article postdetail-about active" data-page="about">
              <header><h2 className="postdetail-h2 postdetail-article-title">신날두~~</h2></header>

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
                <p>안녕 OO아너를처음본순간부터좋아했어방학전에고백하고싶었는데바보같이그땐용기가없더라지금은이수많은사람들앞에서오로지너만사랑한다고말하고싶어서큰마음먹고용기내어봐매일매일버스에서너볼때마다두근댔고동아리랑과활동에서도너만보이고너생각만나고지난3월부터계속그랬어니가남자친구랑헤어지고니맘이아파울때내마음도너무아팠지만내심좋은맘두있었어이런내맘을어떻게말할지고민하다가정말인생에서제일크게용기내어세상에서제일멋지게많은사람들앞에서너한테고백해주고싶었어사랑하는OO님내여자가되줄래?아니나만의태양이되어줄래?난너의달님이될게내일3시반에너수업마치고학관앞에서기다리고있을게너를사랑하는OO이가.</p>
                <p>My job is to build your website so that it is functional and user-friendly but at the same time attractive. Moreover, I add personal touch to your product and make sure that is eye-catching and easy to use. My aim is to bring across your message and identity in the most creative way. I created web design for many famous brand companies.</p>
                <img src="https://i.postimg.cc/CKHSGSLR/image.jpg" alt="피곤명수"  className="postdetail-about-image" />
                <p> 김종국님 결혼 축하드립니다~!</p>
                <img src="https://i.postimg.cc/DwBL6JfG/image.webp" alt="종국이형"  className="postdetail-about-image" />
                <p> 김종국님 결혼 축하드립니다~!</p>
                {/* <img src=" https://i.postimg.cc/05JDDdJ6/image.jpg" alt="좌절쿠냐"  className="postdetail-about-image" />
                <p>맹구는 역시 맹구였나. 그라운드에서 즙짜는 마테우스 쿠냐 "나 다시 울브스로 돌아갈래" </p>
                <br></br><p>맹구팬은 쿠냐의 이런 발언에 오열하는중. 한편 일부 팬들은 "어차피 맹구는 누가와도 안된다"라며 아쉬움이 가득하다.</p>
                <p>한국에 거주하는 맹구의 팬 김민석님은 앞으로 남은 시즌동안 맹구의 강등 시나리오를 몸소 체감하고 있다</p> */}


            
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