import React, { useState } from 'react';
import './mypage.css';
import Header from '../components/Header';
import { createGlobalStyle } from 'styled-components';


function ProfileCard() {
     const MypageStyle = createGlobalStyle`
      :root {
    --theme-bg-color: #FFFFFF;
    --app-bg-color: #FCFCFF;
    --border-color: #DDDDDD;
    --theme-color: #0C0F1F;
    --subtext-color: #636363;
    --inactive-color: #333333;
    --body-font: "Rethink Sans", sans-serif;
    --hover-menu-bg: #F3F4F6;
    --content-title-color: #020919;
    --content-bg: #FFFFFF;
    --button-inactive: #DDDDDD;
    --x-close-button-color: #898989;
    --dropdown-bg: #F3F4F6;
    --dropdown-hover: #FCFCFE;
    --popup-bg: #ffffff;
    --search-bg: #ffffff;
    --overlay-bg: #ffffff;
    --scrollbar-bg: rgb(1 2 3 / 40%);
    --input-radius: 9px;
    --button-radius: 8px;
    --card-radius: 16px;
    --container-radius: 20px;
    --tabs-radius: 20px;
    --modal-radius: 16px;
    
  }

  
#root {
    width: 100%; /* #root가 body 너비 100%를 가져감 */
    /* ✨✨ #root도 Flexbox로 만들어서 자식들 정렬! ✨✨ */
    display: flex; /* 자식 요소들을 flex 아이템으로 만듦 */
    flex-direction: column; /* 자식 요소들을 세로(컬럼) 방향으로 배치 */
    align-items: center; /* 자식 요소들을 수평(가로) 가운데 정렬! */

 gap: 80px;
    /* 추가: #root 자체에도 max-width를 줘서 전체 컨텐츠의 최대 너비를 제한할 수도 있어 */
    /* max-width: 1200px; */
    /* margin: 0 auto; */
}
    
* {
	box-sizing: border-box;
	font-family: var(--body-font);
	margin: 0;
	padding: 0;
  
}
body {
  background-color: #e4e1da;
    min-height: 100vh;
	display: flex;
	justify-content: center;
   /* ✨✨ 요기 변경! Header를 위로 붙일 핵심! ✨✨ */
    align-items: flex-start; /* 자식 요소(#root)를 세로(교차 축)의 맨 위로 정렬! */
        box-shadow: 10px 10px 10px #000000, -10px -10px 10px #f3f1e5;

  
}
        .buttons {
	display: flex;
	justify-content: flex-end;
	gap: 10px;
	margin-top: 24px;
}

.buttons button {
	padding: 9px 16px;
	border: none;
	border-radius: var(--button-radius);
	cursor: pointer;
	font-weight: 500;
	font-size: 14px;
}

  `;
  // 1. 원본 사용자 정보 (초기값이며, 저장 버튼 누르면 업데이트될 값)
  const [userInfo, setUserInfo] = useState({
    firstName: "Jenna",
    lastName: "Doe",
    email: "jennadoe@example.com",
    country: "🇺🇸 United States",
    username: "jennadoe"
  });

  // 2. 편집 모드 여부를 관리하는 상태
  const [isEditing, setIsEditing] = useState(false);

  // 3. 편집 중인 데이터를 임시로 저장하는 상태
  //    (취소 시 원본 userInfo가 유지되도록 분리)
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });

  // '수정' 버튼 클릭 핸들러
  const handleEditClick = () => {
    // 수정 모드 진입 시, 현재 userInfo를 editedUserInfo에 복사
    setEditedUserInfo({ ...userInfo });
    setIsEditing(true);
  };

  // '취소' 버튼 클릭 핸들러
  const handleCancelClick = () => {
    setIsEditing(false);
    // (선택 사항) editedUserInfo를 다시 원본으로 돌릴 필요는 없지만,
    // 명시적으로 다음 편집을 위해 원본 복사본으로 초기화할 수도 있음
    // setEditedUserInfo({ ...userInfo });
  };

  // '저장' 버튼 클릭 핸들러
  const handleSaveClick = () => {
    // editedUserInfo의 내용을 userInfo로 업데이트
    setUserInfo({ ...editedUserInfo });
    setIsEditing(false);
    alert('저장되었습니다!'); // 저장 알림 (실제 앱에서는 API 호출 등)
  };

  // 입력 필드 변경 시 호출될 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target; // 변경된 input의 name과 value 가져옴
    setEditedUserInfo((prev) => ({
      ...prev,
      [name]: value // 해당 name의 필드 값만 업데이트
    }));
  };

  return (
    <>
        <MypageStyle/>
          <Header />
    <div className="profile-card">
      {/*
      <div className="top-right">
        <button>Archive</button>
        <button>View orders</button>
      </div>
      */}
      <div className="profile-header">
        <img src="https://randomuser.me/api/portraits/women/79.jpg" className="avatar" alt="Profile" />
        <div>
          <h2>Jenna Doe
            {/*
            <span className="tag">Rank Here</span>
            */}
          </h2>
          <p className="meta">jannadoe@example.com</p>
        </div>
      </div>

      {/* '정보 보기'와 '수정' 모드에 따라 다르게 렌더링 */}
      {!isEditing ? ( // 뷰 모드일 때 (수정 중이 아닐 때)
        <>
          <div className="mypage-info">
            <div>
              <span className="meta-label">가입 날짜</span>
              <div className="meta-value">1 Mar, 2025</div>
            </div>
            <div>
              <span className="meta-label">수정 날짜</span>
              <div className="meta-value">4 Mar, 2025</div>
            </div>
            <div>
              <span className="meta-label">Revenue</span>
              <div className="meta-value">$118.00</div>
            </div>
            <div>
              <span className="meta-label">MRR</span>
              <div className="meta-value">$0.00</div>
            </div>
          </div>
          <div className="mypage-field">
            <label>이름</label>
            {/* 텍스트로 보여줌 */}
            <p>{userInfo.firstName}</p>
          </div>
          <div className="mypage-field">
            <label>닉네임</label>
            <p>{userInfo.lastName}</p>
          </div>
          <div className="mypage-field">
            <label>이메일 주소</label>
            <p>{userInfo.email}</p>
            <p className="meta">✔ VERIFIED 2 JAN, 2025</p>
          </div>
          <div className="mypage-field">
            <label>Country</label>
            <p>{userInfo.country}</p>
          </div>
          
        </>
      ) : ( // 편집 모드일 때
        <>
          <div className="mypage-info">
            {/* meta-info는 보통 편집 모드에서는 숨기거나 다르게 표현 (여기서는 그대로 유지) */}
            <div>
              <span className="meta-label">First seen</span>
              <div className="meta-value">1 Mar, 2025</div>
            </div>
            <div>
              <span className="meta-label">Last seen</span>
              <div className="meta-value">4 Mar, 2025</div>
            </div>
            <div>
              <span className="meta-label">Revenue</span>
              <div className="meta-value">$118.00</div>
            </div>
            <div>
              <span className="meta-label">MRR</span>
              <div className="meta-value">$0.00</div>
            </div>
          </div>
          <div className="mypage-field">
            <label>이름</label>
            {/* 입력 필드로 보여줌 */}
            <input 
              type="text" 
              name="firstName" // `name` 속성이 `handleChange`에서 사용됨
              value={editedUserInfo.firstName} // 현재 편집 중인 값
              onChange={handleChange} // 값 변경 핸들러 연결
            />
          </div>
          <div className="mypage-field">
            <label>닉네임</label>
            <input 
              type="text" 
              name="lastName" 
              value={editedUserInfo.lastName} 
              onChange={handleChange} 
            />
          </div>
          <div className="mypage-field">
            <label>이메일 주소</label>
            <input 
              type="email" 
              name="email" 
              value={editedUserInfo.email} 
              onChange={handleChange} 
            />
            <p className="meta">✔ VERIFIED 2 JAN, 2025</p>
          </div>
          <div className="mypage-field">
            <label>Country</label>
            <select 
              name="country" 
              value={editedUserInfo.country} 
              onChange={handleChange}
            >
              {/* 여기에 실제 Country 목록을 동적으로 넣을 수 있음 */}
              <option>🇺🇸 United States</option>
              <option>🇰🇷 South Korea</option>
              <option>🇯🇵 Japan</option>
              {/* 다른 나라 옵션 추가 */}
            </select>
          </div>
          
        </>
      )}

      {/* 버튼들도 모드에 따라 다르게 렌더링 */}
      <div className="buttons">
        {!isEditing ? ( // 뷰 모드일 때
          // '수정' 버튼 하나만 보여줌
          <button className="save-btn" onClick={handleEditClick}>수정</button> // HTML의 save-btn 클래스를 활용했지만, 실제 기능은 편집 시작
        ) : ( // 편집 모드일 때
          // '취소'와 '저장' 버튼 보여줌
          <>
            <button className="cancel-btn" onClick={handleCancelClick}>취소</button>
            <button className="save-btn" onClick={handleSaveClick}>저장</button>
          </>
        )}
      </div>
    </div>

    </>
  );
}

export default ProfileCard;