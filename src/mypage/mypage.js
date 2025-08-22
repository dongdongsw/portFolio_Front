import React, { useState } from 'react';
import './mypage.css';
import Header from '../components/Header';
import { createGlobalStyle } from 'styled-components';
import logo from './10.png'; 


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
      width: 100%; 
      display: flex;
      flex-direction: column; 
      align-items: center; 
       gap: 80px;
       
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
      align-items: flex-start; 
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
      font-weight: 700;
      font-size: 14px;
    }

  `;
  
  const [userInfo, setUserInfo] = useState({
    loginid: "testid",
    nickname: "서동현",
    password: "1234",
    email: "jennadoe@example.com",
    country: "🇺🇸 United States",

  });

  // 편집 모드 여부를 관리하는 상태
  const [isEditing, setIsEditing] = useState(false);

  // 편집 중인 데이터를 임시로 저장하는 상태
  const [editedUserInfo, setEditedUserInfo] = useState({ ...userInfo });

  // 인증번호 입력창 보일지 말지
  const [showVerificationInput, setShowVerificationInput] = useState(false);

  // 사용자가 입력한 인증번호 상태
  const [verificationCode, setVerificationCode] = useState(''); 

    const [newEmail, setNewEmail] = useState(''); // 새로운 이메일 주소를 위한 상태


  // '수정' 버튼 클릭 핸들러
  const handleEditClick = () => {
    setEditedUserInfo({ ...userInfo });
    setIsEditing(true);
  };

  // '탈퇴' 버튼 클릭 핸들러
  const handlesecessionClick = () => {
    //탈퇴 기능
  };

  // '취소' 버튼 클릭 핸들러
  const handleCancelClick = () => {
    setIsEditing(false);
    
    // setEditedUserInfo({ ...userInfo });
  };

  // '저장' 버튼 클릭 핸들러
  const handleSaveClick = () => {
    setUserInfo({ ...editedUserInfo });
    setIsEditing(false);
    alert('저장되었습니다!'); // 저장 알림 (실제 앱에서는 API 호출 등)
  };

  // 입력 필드 변경 시 호출될 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUserInfo((prev) => ({
      ...prev,
      [name]: value 
    }));
  };

  // '이메일 인증' 버튼 클릭 핸들러
  const handleEmailVerificationClick = () => {
    // 💥 여기에 이메일로 인증번호를 보내는 API 호출 로직 들어가야 해! (예: axios.post('/api/send-email-verification', { email: editedUserInfo.newEmail }))
    alert('인증번호가 이메일로 발송되었습니다!'); // 사용자에게 알림
    setShowVerificationInput(true); // 인증번호 입력창 보여주기
  };

  // '인증 확인' 버튼 클릭 핸들러 (새로 추가될 버튼)
  const handleVerifyCodeClick = () => {
    // 💥 여기에 사용자가 입력한 인증번호를 검증하는 API 호출 로직 들어가야 해! (예: axios.post('/api/verify-email-code', { email: editedUserInfo.newEmail, code: verificationCode }))
    if (verificationCode === '123456') { // 실제로는 서버에서 받은 코드로 비교해야 함! 임시로 '123456'
      alert('이메일 인증이 완료되었습니다!');
      setShowVerificationInput(false); // 인증 완료되면 입력창 숨기기
      // 인증 완료 상태를 어딘가에 저장 (예: editedUserInfo에 인증 여부 필드 추가)
    } else {
      alert('인증번호가 일치하지 않습니다. 다시 확인해주세요.');
    }
  };

  // 인증번호 입력 필드 변경 핸들러
  const handleVerificationCodeChange = (e) => {
    setVerificationCode(e.target.value);
  };

  // 새로운 이메일 입력 필드 변경 핸들러
  const handleNewEmailChange = (e) => {
    setNewEmail(e.target.value);
  };
  return (
    <>
        <MypageStyle/>
          {/* <Header /> */}
          <div className = "login-header">
        <a href="http://localhost:3000">
            <img src={logo} width="150" height="150" alt="logo" />
          </a>
      </div>
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
          <h2>Jenna Doe</h2>
          <p className="meta">jannadoe@example.com</p>
        </div>
      </div>
      {!isEditing ? ( 
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
            {/* <div>
              <span className="meta-label">Revenue</span>
              <div className="meta-value">$118.00</div>
            </div>
            <div>
              <span className="meta-label">MRR</span>
              <div className="meta-value">$0.00</div>
            </div> */}
          </div>

          {/* <div className="mypage-container"> */}
            <div className="mypage-field">
              <label>아이디</label>
              <p>{userInfo.loginid}</p>
            </div>
            <div className="mypage-field">
              <label>비밀번호</label>
              <p>{userInfo.password}</p>
            </div>

            <div className="mypage-field">
              <label>닉네임</label>
              <p>{userInfo.nickname}</p>
            </div>
            
            <div className="mypage-field">
              <label>이메일 주소</label>
              <p>{userInfo.email}</p>
            </div>
          {/* </div> */}
        </>
      ) : ( // 편집 모드일 때
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
            {/* <div>
              <span className="meta-label">Revenue</span>
              <div className="meta-value">$118.00</div>
            </div>
            <div>
              <span className="meta-label">MRR</span>
              <div className="meta-value">$0.00</div>
            </div> */}
          </div>
          <div className="mypage-field">
            <label>아이디</label>
            <input 
              type="text" 
              name="name" 
              value={editedUserInfo.loginid} 
              onChange={handleChange} 
              disabled
            />
          </div>
          <div className="mypage-field">
            <label>닉네임</label>
            <div className="nickname-input-group"> 
            <input 
              type="text" 
              name="nickname" 
              value={editedUserInfo.nickname} 
              onChange={handleChange} 
            />
            <button type="button" className="check-duplicate-btn">중복 확인</button> 
          </div>
          </div>
          <div className="mypage-pw">
            <div className="mypage-field-a">
              <label>비밀번호</label>
              <input 
                type="text" 
                name="password" 
                // value="기존 비밀번호"
                placeholder='기존 비밀번호'
                onChange={handleChange} 
              />
            </div>
            <div className="mypage-field-a" >
              <input 
                type="text" 
                name="password" 
                // value="새 비밀번호" 
                placeholder='새 비밀번호'
                onChange={handleChange} 
              />
            </div>
            <div className="mypage-field-a">
              <input 
                type="text" 
                name="password" 
                // value="새 비밀번호 재확인" 
                placeholder='새 비밀번호 재확인'
                onChange={handleChange} 
              />
            </div>
          </div>
          <div className="mypage-pw"> 
            
            <div className="mypage-field-a">
              <label>이메일 주소</label>
            <div className="nickname-input-group"> 
                <input 
                  type="email" 
                  name="email" 
                  value={editedUserInfo.email}
                  onChange={handleChange}
                  disabled
                />
                <button 
                  type="button" 
                  className="check-duplicate-btn" 
                  onClick={handleEmailVerificationClick}
                >
                  인증
                </button>
              </div>
              {showVerificationInput && (
            <div className="nickname-input-group"> 
                  <input
                    type="text"
                    name="verificationCode"
                    placeholder="인증번호 6자리 입력"
                    value={verificationCode}
                    onChange={handleVerificationCodeChange}
                    maxLength="6"
                    autoComplete="off"
                  />
                  <button
                    type="button"
                    className="check-duplicate-btn"
                    onClick={handleVerifyCodeClick}
                  >
                    인증 확인
                  </button>
                </div>
              )}
            </div>

            <div className="mypage-field-a"> 
              <input 
                type="email" 
                name="newEmail" 
                value={newEmail} 
                placeholder='새로운 이메일 주소 (변경)'
                onChange={handleNewEmailChange} 
              />
            </div>
          </div>
        </>
      )}
      <div className="buttons">
        {!isEditing ? ( // 뷰 모드일 때
          <>
            <button className="secession-btn" onClick={handlesecessionClick}>탈퇴</button>
            <button className="save-btn" onClick={handleEditClick}>수정</button> 
        </>
        ) : ( // 편집 모드일 때
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