import React, { useState,useEffect  } from 'react';
import './mypage.css';
import Header from '../components/Header';
import { createGlobalStyle } from 'styled-components';
import logo from './10.png'; 
import axios from 'axios'; // Axios 임포트!

axios.defaults.withCredentials = true;

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

  // 초기값은 null로 두어 API 로딩 전에는 렌더링되지 않도록 처리
  const [userInfo, setUserInfo] = useState(null); // 실제 보여줄 사용자 정보

  const [editedUserInfo, setEditedUserInfo] = useState({ 
    loginid: '',
    nickname: '',
    email: '',
    // 기타 프로필 정보 (DB에서 오는 것들)
    registdate: '', // 가입 날짜
    pwupdate: '' // 비밀번호 업데이트 날짜
  });

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [newEmail, setNewEmail] = useState(''); // 사용자가 입력하는 새로운 이메일
  const [showVerificationInput, setShowVerificationInput] = useState(false); // 인증번호 입력창 표시 여부
  const [verificationCode, setVerificationCode] = useState(''); // 사용자가 입력하는 인증번호
  const [isEditing, setIsEditing] = useState(false); // 편집 모드 여부
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태
  const [error, setError] = useState(null); // 에러 메시지

  // 사용자 정보 불러오기
  useEffect(() => {
    const fetchUserInfo = async () => {
      try {

        setIsLoading(true);
        setError(null);
        const response = await axios.get('/api/mypage/info');
        const userData = response.data; // UserResponseDto 객체

        setUserInfo(userData);
        setEditedUserInfo(userData); 

      } catch (err) {

        console.error("사용자 정보 로딩 중 오류 발생:", err);
        setError("사용자 정보를 불러오는데 실패했습니다.");

      } finally {

        setIsLoading(false);

      }
    };

    fetchUserInfo();
  }, []);

  // === 입력 필드 변경 핸들러 ===
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedUserInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // 비밀번호 입력 필드 변경
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;

    if (name === "currentPassword") setCurrentPassword(value);

    else if (name === "newPassword") setNewPassword(value);

    else if (name === "confirmNewPassword") setConfirmNewPassword(value);
  };

  // 새로운 이메일 입력 필드 변경
  const handleNewEmailChange = (e) => {

    setNewEmail(e.target.value);

  };

  // 인증번호 입력 필드 변경
  const handleVerificationCodeChange = (e) => {

    setVerificationCode(e.target.value);

  };

  // 닉네임 중복 확인
  const handleNicknameDuplicateCheck = async () => {
    if (!editedUserInfo.nickname) {

      alert("닉네임을 입력해주세요.");

      return;
    }
    try {
      const response = await axios.get(`/api/mypage/nickname/check-availability?nickname=${editedUserInfo.nickname}`);

      alert(response.data); // 백엔드 메시지 출력

    } catch (err) {

      console.error("닉네임 중복 확인 중 오류:", err);

      if (err.response && err.response.data) {

        alert(err.response.data); // 백엔드 메시지 출력

      } else {

        alert('닉네임 중복 확인에 실패했습니다. 다시 시도해주세요.');

      }
    }
  };


  // 이메일 인증 요청
  const handleEmailVerificationClick = async () => {
    if (!newEmail) {

      alert("새로운 이메일 주소를 입력해주세요.");

      return;
    }
    // 프론트에서 간단한 이메일 형식 검증 
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(newEmail)) {

      alert("유효한 이메일 형식이 아닙니다.");

      return;
    }

    try {
      const response = await axios.post('/api/mypage/email/request-verification', { newEmail: newEmail });

      alert(response.data); // 백엔드 메시지 출력

      setShowVerificationInput(true); // 인증번호 입력창 보여주기

    } catch (err) {

      console.error("인증번호 발송 중 오류 발생:", err);

      if (err.response && err.response.data) {

        alert(err.response.data); // 백엔드 메시지 출력

      } else {

        alert('인증번호 발송에 실패했습니다. 다시 시도해주세요.');

      }
    }
  };

  // 이메일 인증 코드 검증
  const handleVerifyCodeClick = async () => {
  if (!verificationCode) {

    alert("인증번호를 입력해주세요.");

    return;

  }
  try {
    const response = await axios.post('/api/mypage/email/verify-code', { code: verificationCode });

    alert(response.data); // "이메일 인증이 성공적으로 완료되었습니다."

    // 기존 이메일은 건드리지 않고, 단지 인증 성공 상태만 유지
    setShowVerificationInput(false);
    // 인증 성공 표시만 하고 email은 바꾸지 않음
  } catch (err) {

    console.error("인증번호 확인 중 오류:", err);
    alert(err.response?.data || "인증번호 확인에 실패했습니다. 다시 시도해주세요.");

  }
};


  // 최종 정보 저장
const handleSaveClick = async () => {
  // 비밀번호 유효성 검사
  if (currentPassword || newPassword || confirmNewPassword) {
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert("비밀번호를 변경하려면 현재 비밀번호, 새 비밀번호, 새 비밀번호 확인을 모두 입력해야 합니다.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      alert("새 비밀번호와 새 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (newPassword.length < 8 || newPassword.length > 20) {
      alert("새 비밀번호는 8자 이상 20자 이하여야 합니다.");
      return;
    }
  }

  try {
    const updateData = {
      newNickname: editedUserInfo.nickname,
      newEmail: newEmail || null,  // ✅ 새 이메일만 PATCH로 보냄 (기존 email은 유지)
      currentPassword: currentPassword || null,
      newPassword: newPassword || null,
      newPasswordConfirm: confirmNewPassword || null
    };

    console.log("PATCH payload", updateData); // 디버깅용

    const response = await axios.patch('/api/mypage', updateData);

    // ✅ 저장 성공 시 기존 이메일을 새 이메일로 갱신
    if (newEmail) {
      setEditedUserInfo((prev) => ({ ...prev, email: newEmail }));
      setNewEmail('');
    }

    setUserInfo({ ...editedUserInfo });
    setIsEditing(false);

    // 비밀번호 필드 초기화
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');

    alert(response.data);
  } catch (err) {
    console.error("정보 저장 중 오류 발생:", err);
    alert(err.response?.data || '정보 저장에 실패했습니다. 다시 시도해주세요.');
  }
};


  // 탈퇴
const handlesecessionClick = async () => {
  if (!window.confirm("정말로 회원 탈퇴를 하시겠습니까? 모든 정보가 삭제되며 되돌릴 수 없습니다.")) {
    return;
  }
  try {
    const response = await axios.delete('/api/mypage/delete');
    alert(response.data);

    // 로그아웃 or 메인 페이지 이동
    window.location.href = "/"; 
  } catch (err) {
    console.error("회원 탈퇴 중 오류 발생:", err);
    if (err.response && err.response.data) {
      alert(`탈퇴 실패: ${err.response.data}`);
    } else {
      alert('회원 탈퇴에 실패했습니다. 다시 시도해주세요.');
    }
  }
};


  // UI 핸들러
  const handleEditClick = () => {
    // 편집 모드 진입 시, 현재 userInfo를 editedUserInfo로 복사
    // 이렇게 해야 사용자가 취소했을 때 원본 데이터가 보존됨
    setEditedUserInfo({ ...userInfo });
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    // 취소 시 원본 userInfo로 되돌리고 편집 모드 종료
    // 비밀번호/이메일 관련 임시 상태 초기화
    setEditedUserInfo({ ...userInfo });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmNewPassword('');
    setNewEmail('');
    setShowVerificationInput(false);
    setVerificationCode('');
    setIsEditing(false);
  };

  // 로딩 및 에러 처리 UI
  if (isLoading) {
    return (
      <>
        <MypageStyle />
        {/* <Header /> */}
        <div className="login-header">
          <a href="http://localhost:3000">
            <img src={logo} width="150" height="150" alt="logo" />
          </a>
        </div>
        <div className="profile-card" style={{ textAlign: 'center', padding: '50px' }}>
          정보를 불러오는 중입니다... 
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <MypageStyle />
        {/* <Header /> */}
        <div className="login-header">
          <a href="http://localhost:3000">
            <img src={logo} width="150" height="150" alt="logo" />
          </a>
        </div>
        <div className="profile-card" style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
          <p>오류 발생: {error}</p>
          <p>잠시 후 다시 시도해주세요.</p>
        </div>
      </>
    );
  }
  return (
    <>
      <MypageStyle />
      {/* <Header /> */}
      <div className="login-header">
        <a href="http://localhost:3000">
          <img src={logo} width="150" height="150" alt="logo" />
        </a>
      </div>
      <div className="profile-card">
        <div className="profile-header">
          <img src="https://randomuser.me/api/portraits/women/79.jpg" className="avatar" alt="Profile" />
          <div>
            {/* userInfo가 로드된 후에만 접근 */}
            <h2>{userInfo?.nickname}</h2>
            <p className="meta">{userInfo?.email}</p>
          </div>
        </div>

        {!isEditing ? (
          <>
            {/* === 뷰 모드 === */}
            <div className="mypage-info">
              <div>
                <span className="meta-label">가입 날짜</span>
                {/* registdate나 pwupdate 같은 LocalDate/LocalDateTime은 프론트에서 Date 객체로 파싱하거나 문자열로 변환 필요 */}
                <div className="meta-value">{userInfo?.registdate ? new Date(userInfo.registdate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <span className="meta-label">비밀번호 업데이트</span>
                <div className="meta-value">{userInfo?.pwupdate ? new Date(userInfo.pwupdate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div className="mypage-field">
              <label>아이디</label>
              <p>{userInfo?.loginid}</p>
            </div>
            <div className="mypage-field">
              <label>비밀번호</label>
              <p>********</p> {/* 보안상 항상 가려줌 */}
            </div>

            <div className="mypage-field">
              <label>닉네임</label>
              <p>{userInfo?.nickname}</p>
            </div>

            <div className="mypage-field">
              <label>이메일 주소</label>
              <p>{userInfo?.email}</p>
            </div>
          </>
        ) : (
          <>
            {/* === 편집 모드 === */}
            <div className="mypage-info">
              <div>
                <span className="meta-label">가입 날짜</span>
                <div className="meta-value">{userInfo?.registdate ? new Date(userInfo.registdate).toLocaleDateString() : 'N/A'}</div>
              </div>
              <div>
                <span className="meta-label">비밀번호 업데이트</span>
                <div className="meta-value">{userInfo?.pwupdate ? new Date(userInfo.pwupdate).toLocaleDateString() : 'N/A'}</div>
              </div>
            </div>

            <div className="mypage-field">
              <label>아이디</label>
              <input
                type="text"
                name="loginid" // name 속성을 loginid로 변경
                value={editedUserInfo.loginid}
                onChange={handleChange}
                disabled // 아이디는 보통 수정 불가
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
                  maxLength="20" 
                />
                <button type="button" className="check-duplicate-btn" onClick={handleNicknameDuplicateCheck}>중복 확인</button>
              </div>
            </div>

            {/* 비밀번호 변경 필드 */}
            <div className="mypage-pw">
              <div className="mypage-field-a">
                <label>현재 비밀번호</label>
                <input
                  type="password" 
                  name="currentPassword"
                  value={currentPassword} 
                  placeholder='현재 비밀번호'
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="mypage-field-a" >
                <label>새 비밀번호</label>
                <input
                  type="password" 
                  name="newPassword"
                  value={newPassword} 
                  placeholder='새 비밀번호 (8~20자)'
                  onChange={handlePasswordChange} 
                />
              </div>
              <div className="mypage-field-a">
                <label>새 비밀번호 재확인</label>
                <input
                  type="password" 
                  name="confirmNewPassword"
                  value={confirmNewPassword}
                  placeholder='새 비밀번호 재확인'
                  onChange={handlePasswordChange}
                />
              </div>
            </div>

            {/* 이메일 변경 필드 */}
            <div className="mypage-pw">
              <div className="mypage-field-a">
                <label>현재 이메일 주소</label>
                <div className="nickname-input-group">
                  <input
                    type="email"
                    name="email"
                    value={editedUserInfo.email} // 현재 편집 중인 이메일
                    disabled // 직접 수정 불가
                  />
                </div>
              </div>

               {/* 새 이메일 */}
  <div className="mypage-field-a">
    <label>새 이메일 주소</label>
    <div className="nickname-input-group">
      <input
        type="email"
        name="newEmail"
        value={newEmail}
        placeholder="새로운 이메일 주소 입력"
        onChange={handleNewEmailChange}
      />
      <button
        type="button"
        className="check-duplicate-btn"
        onClick={handleEmailVerificationClick}
      >
        인증 요청
      </button>
    </div>

    {/* 인증번호 입력창 */}
    {showVerificationInput && (
      <div className="nickname-input-group" style={{ marginTop: '10px' }}>
        <input
          type="text"
          name="verificationCode"
          placeholder="인증번호 6자리 입력"
          value={verificationCode}
          onChange={handleVerificationCodeChange}
          maxLength="7"
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
</div>
          </>
        )}
        {/* 버튼 영역 */}
        <div className="buttons">
          {!isEditing ? (
            <>
              <button className="secession-btn" onClick={handlesecessionClick}>탈퇴</button>
              <button className="save-btn" onClick={handleEditClick}>수정</button>
            </>
          ) : (
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