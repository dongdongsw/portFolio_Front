import React, { useState } from 'react';
import './login.css'; 
import '../../commonness.css';
import { createGlobalStyle } from 'styled-components';
import FindIdModal from './find_login/find_id';
import FindPwModal from './find_login/find_pw';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './10.png'; // 로고 이미지 추가

const GlobalStyle = createGlobalStyle`
    body {
      width: 100%;
      background-color: #e4e1da; 
      font-size: 14px; 
      height: 100vh; 
      -webkit-font-smoothing: antialiased; 
      -moz-osx-font-smoothing: grayscale; 
      font-family: 'proxima-nova-soft', sans-serif; 
      display: flex; 
      color: #6f6767; 
      align-items: center; 
      justify-content: center;
    }
    *, *::after, *::before {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
    }
    .button {
      width: 180px;
      height: 50px;
      border-radius: 25px;
      margin-top: 50px;
      font-weight: 700;
      font-size: 14px;
      letter-spacing: 1.15px;
      background-color: #c7c8cc;
      color: #f9f9f9;
      box-shadow: 8px 8px 16px #d1d9e6, -8px -8px 16px #f9f9f9;
      border: none;
      outline: none;
      cursor: pointer;
    }
    html, body { overflow-x: hidden; }
    .title { font-size: 34px; font-weight: 700; line-height: 3; color: #6f6767; }

    .verification-container {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .verification-container input { flex: 2; }
    .verification-container button { flex: 1; }

    /* === 약관 영역 스타일 === */
    .terms-row {
      margin-top: 10px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 13px;
      line-height: 1;
      width: 350px;
    }
    .terms-button {
      padding: 8px 12px;
      border-radius: 16px;
      border: none;
      background: #bfc0c4;
      color: #fff;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 4px 4px 8px #d1d9e6, -4px -4px 8px #f9f9f9;
    }
    .terms-checkboxes {
      display: flex;
      gap: 12px;
      align-items: center;
    }
    .terms-checkboxes label {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      cursor: pointer;
      user-select: none;
    }
    .terms-checkboxes input[type="checkbox"] {
      width: 16px;
      height: 16px;
      cursor: pointer;
    }

    /* === 약관 모달 === */
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.35);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }
    .modal-card {
      width: 50%;
      max-width: 360px;
      max-height: 80vh;
      background: #e4e1da;
      border-radius: 16px;
      padding: 20px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.2);
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .modal-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .modal-title {
      font-size: 20px;
      font-weight: 800;
      color: #555050;
    }
    .modal-close {
      border: none;
      background: transparent;
      font-size: 18px;
      cursor: pointer;
    }
    .modal-content {
      overflow: auto;
      padding-right: 6px;
      color: #6f6767;
      line-height: 1.5;
    }
    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 8px;
    }
    .modal-footer button {
      padding: 8px 12px;
      border-radius: 10px;
      border: none;
      cursor: pointer;
    }

    /* === 작은 알림 모달 === */
    .alert-modal {
      background: #e4e1da;
      border-radius: 12px;
      padding: 20px;
      box-shadow: 0 6px 20px rgba(0,0,0,0.25);
      max-width: 300px;
      text-align: center;
    }
    .alert-modal p {
      margin-bottom: 12px;
      color: #333;
    }
    .alert-modal button {
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      background: #c7c8cc;
      color: #fff;
      cursor: pointer;
    }
  `;

function Login() {
  const navigate = useNavigate();

  const [isSignInActive, setIsSignInActive] = useState(true);

  const [signupErrors, setSignupErrors] = useState({
    loginid: false,
    email: false,
    loginpw: false,
    nickname: false,
  });

  const [errorMessages, setErrorMessages] = useState({
    loginid: "",
    email: "",
    loginpw: "",
    nickname: "",
  });

  const [signupData, setSignupData] = useState({
    loginid: "",
    loginpw: "",
    email: "",
    nickname: "",
  });
  const [loginData, setLoginData] = useState({
    loginid: "",
    loginpw: "",
  });

  const [showIdModal, setShowIdModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInitialId, setPwInitialId] = useState("");

  // === 약관 관련 상태 ===
  const [showTerms, setShowTerms] = useState(false);
  const [agree, setAgree] = useState(false);
  const [disagree, setDisagree] = useState(false);

  // === 작은 알림 모달 ===
  const [alertMessage, setAlertMessage] = useState("");

  // ID, 이메일, 닉네임 중복 확인
  const checkDuplicate = async (field, value) => {
    if (!value) return;

    const urlMap = {
      loginid: "/check-id",
      email: "/check-email",
      nickname: "/check-nickname"
    };

    try {
      await axios.get(`http://localhost:8080/api/user${urlMap[field]}`, {
        params: { [field]: value },
        withCredentials: false
      });

      // 중복 없음 → 오류 제거
      setSignupErrors(prev => ({ ...prev, [field]: false }));
      setErrorMessages(prev => ({ ...prev, [field]: "" }));
    } catch (err) {
      // 에러 처리
      let msg = `${field} 확인 중 문제가 발생했습니다.`; // 기본 메시지

      if (err.response?.data) {
        // 서버에서 전달한 메시지
        if (typeof err.response.data === "string") {
          msg = err.response.data;
        } else if (err.response.data.message) {
          msg = err.response.data.message;
        }
      } else if (err.message) {
        // axios 자체 에러 메시지
        msg = err.message;
      }

      setSignupErrors(prev => ({ ...prev, [field]: true }));
      setErrorMessages(prev => ({ ...prev, [field]: msg }));
    }
  };

  const handleSignupChange = (e) => {
    const { name, value } = e.target;
    setSignupData({ ...signupData, [name]: value });

    if (value.trim() !== "") {
      setSignupErrors(prev => ({ ...prev, [name]: false }));
      setErrorMessages(prev => ({ ...prev, [name]: "" }));
    }
  };
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // 회원가입 제출
  const handleSignupSubmit = async (e) => {
    e.preventDefault();

  // 회원가입 정보 중 하나라도 입력하지 않을 시 경고
  const errors = {
    loginid: !signupData.loginid.trim(),
    email: !signupData.email.trim(),
    loginpw: !signupData.loginpw.trim(),
    nickname: !signupData.nickname.trim(),
  };
  setSignupErrors(errors);
    
    // 회원가입 정보 중 하나라도 입력하지 않을 시 출력
     if (!signupData.loginid || !signupData.email || !signupData.loginpw || !signupData.nickname) {
    setAlertMessage("모든 정보를 입력해주세요.");
    return;
  }

    // 약관 체크 상태 확인
    if (!agree && !disagree) {
      setAlertMessage("약관에 동의해주세요.");
      return;
    }
    if (disagree) {
      setAlertMessage("약관에 동의해야 회원가입이 가능합니다.");
      return;
    }

    try {
      await axios.post(
        "http://localhost:8080/api/user/create",
        signupData,
        { withCredentials: true }
      );
      setAlertMessage("회원가입이 완료되었습니다!");
      setIsSignInActive(true);
      setSignupData({ loginid: "", loginpw: "", email: "", nickname: "" });
      setSignupErrors({ loginid: false, email: false, loginpw: false, nickname: false });
      setErrorMessages({ loginid: "", email: "", loginpw: "", nickname: "" });
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const msg = typeof data === "string" ? data : data?.message || "회원가입 실패";

      if (msg.includes("아이디")) {
        setSignupErrors((prev) => ({ ...prev, loginid: true }));
        setErrorMessages((prev) => ({ ...prev, loginid: msg }));
      } else if (msg.includes("이메일")) {
        setSignupErrors((prev) => ({ ...prev, email: true }));
        setErrorMessages((prev) => ({ ...prev, email: msg }));
      } else if (msg.includes("닉네임")) {
        setSignupErrors((prev) => ({ ...prev, nickname: true }));
        setErrorMessages((prev) => ({ ...prev, nickname: msg }));
      }
      else {
        setAlertMessage(msg);
      }
    }
  };

  // 로그인 제출
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // 1️⃣ 입력 여부 확인
    if (!loginData.loginid.trim() && !loginData.loginpw.trim()) {
      setAlertMessage("아이디와 비밀번호를 입력해주세요.");
      return;
    } else if (!loginData.loginid.trim()) {
      setAlertMessage("아이디를 입력해주세요.");
      return;
    } else if (!loginData.loginpw.trim()) {
      setAlertMessage("비밀번호를 입력해주세요.");
      return;
    }

    // 2️⃣ 서버 요청
    try {
      await axios.post(
        "http://localhost:8080/api/user/login",
        loginData,
        { withCredentials: true }
      );
      navigate('/');
    } catch (err) {
      console.error(err);

      // 서버에서 오는 Access Denied 포함 모든 인증 오류를 통합
      setAlertMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  const handleSignInClick = () => setIsSignInActive(true);
  const handleSignUpClick = () => setIsSignInActive(false);

  // 체크박스 상호배타 처리
  const onToggleAgree = () => {
    setAgree((prev) => {
      const next = !prev;
      if (next) setDisagree(false);
      return next;
    });
  };
  const onToggleDisagree = () => {
    setDisagree((prev) => {
      const next = !prev;
      if (next) setAgree(false);
      return next;
    });
  };

  return (
    <>
      <GlobalStyle />

      <div className="login_main">
        {/* === 회원가입 폼 === */}
        <div className={`containers a-container ${isSignInActive ? 'is-txl' : ''}`}>
          <form className="login_form" onSubmit={handleSignupSubmit}>
            <h2 className="form_title title">Create Account</h2>
            <span className="form__span">or use email for registration</span>

            <input
              className={`form__input ${signupErrors.loginid ? "error-input" : ""}`}
              type="text"
              placeholder="ID"
              name="loginid"
              value={signupData.loginid}
              onChange={handleSignupChange}
              onBlur={() => checkDuplicate("loginid", signupData.loginid)}
            />
            {errorMessages.loginid && (
              <p className="error-text">{errorMessages.loginid}</p>
            )}

            <input
              className={`form__input ${signupErrors.email ? "error-input" : ""}`}
              type="text"
              placeholder="Email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
              onBlur={() => checkDuplicate("email", signupData.email)}
            />
            {errorMessages.email && (
              <p className="error-text">{errorMessages.email}</p>
            )}

            <input
              className={`form__input ${signupErrors.loginpw ? "error-input" : ""}`}
              type="password"
              placeholder="Password"
              name="loginpw"
              value={signupData.loginpw}
              onChange={handleSignupChange}
            />
            {errorMessages.loginpw && (
              <p className="error-text">{errorMessages.loginpw}</p>
            )}

            <input
              className={`form__input ${signupErrors.nickname ? "error-input" : ""}`}
              type="text"
              placeholder="Nickname"
              name="nickname"
              value={signupData.nickname}
              onChange={handleSignupChange}
              onBlur={() => checkDuplicate("nickname", signupData.nickname)}
            />
            {errorMessages.nickname && (
              <p className="error-text">{errorMessages.nickname}</p>
            )}

            {/* === 닉네임 아래 약관 영역 === */}
            <div className="terms-row">
              <button type="button" className="terms-button" onClick={() => setShowTerms(true)}>약관</button>
              <div className="terms-checkboxes">
                <label>
                  <input
                    type="checkbox"
                    checked={agree}
                    readOnly // 직접 체크하지 못하게 설정
                    onClick={() => {
                      if (!showTerms) setAlertMessage("약관을 읽어주세요.");
                    }}
                  /> Agree
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={disagree}
                    readOnly // 직접 체크하지 못하게 설정
                    onClick={() => {
                      if (!showTerms) setAlertMessage("약관을 읽어주세요.");
                    }}
                  /> Disagree
                </label>
              </div>
            </div>

            <button type="submit" className="form__button button submit">SIGN UP</button>
          </form>
        </div>

        {/* === 로그인 폼 === */}
        <div className={`containers b-container ${!isSignInActive ? 'is-txl' : ''} ${isSignInActive ? 'is-z200' : ''}`}>
          <form className="login_form" onSubmit={handleLoginSubmit}>
            <h2 className="form_title title">Sign in to Website</h2>
            <span className="form__span">or use your email account</span>
            <input className="form__input" type="text" placeholder="ID" name="loginid"
              value={loginData.loginid} onChange={handleLoginChange}/>
            <input className="form__input" type="password" placeholder="Password" name="loginpw"
              value={loginData.loginpw} onChange={handleLoginChange}/>
            <p className="form__link">
              Forgot your{" "}
              <button type="button" onClick={() => setShowIdModal(true)}>ID</button>{" "}
              /{" "}
              <button type="button" onClick={() => setShowPwModal(true)}>Password</button>?
            </p>
            <button type="submit" className="form__button button submit">SIGN IN</button>
          </form>
        </div>

        {/* === 스위치 영역 === */}
        <div className={`switch ${!isSignInActive ? 'is-txr is-z200' : ''}`}>
          <div className="switch__circle"></div>
          <div className="switch__circle switch__circle--t"></div>
          <div className={`switch__container ${isSignInActive ? '' : 'is-hidden'}`}>
            <div className="login-header">
              <a href="http://localhost:3000">
                <img src={logo} width="150" height="150" alt="logo"/>
              </a>
            </div>
            <h2 className="switch__title title">Welcome Back !</h2>
            <p className="switch__description description">
              To keep connected with us please login with your personal info
            </p>
            <button className="switch__button button switch-btn" onClick={handleSignUpClick}>SIGN UP</button>
          </div>
          <div className={`switch__container ${!isSignInActive ? '' : 'is-hidden'}`}>
            <h2 className="switch__title title">Hello Friend !</h2>
            <p className="switch__description description">
              Enter your personal details and start journey with us
            </p>
            <button className="switch__button button switch-btn" onClick={handleSignInClick}>SIGN IN</button>
          </div>
        </div>
      </div>

      {/* === 약관 모달 === */}
      {showTerms && (
        <div className="modal-backdrop" onClick={() => setShowTerms(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">Terms of Service</div>
              <button className="modal-close" onClick={() => setShowTerms(false)}>✕</button>
            </div>
            <div className="modal-content">
              <p>
                By using this service, you agree that any photos you upload to your profile may be displayed on the main page. 
              </p>
              <p>
                1) Users must not upload content that violates copyrights.<br />
                2) Users are responsible for accuracy.<br />
                3) The service may remove harmful content.<br />
                4) Uploaded photos may be publicly visible.
              </p>
            </div>

            {/* === 모달 내 체크박스 === */}
            <div className="terms-checkboxes" style={{ justifyContent: "center", marginTop: "10px" }}>
              <label>
                <input 
                  type="checkbox" 
                  checked={agree} 
                  onChange={() => {
                    const next = !agree;
                    setAgree(next);
                    if (next) setDisagree(false);
                  }} 
                />
                Agree
              </label>
              <label>
                <input 
                  type="checkbox" 
                  checked={disagree} 
                  onChange={() => {
                    const next = !disagree;
                    setDisagree(next);
                    if (next) setAgree(false);
                  }} 
                />
                Disagree
              </label>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowTerms(false)}>OK</button>
            </div>
          </div>
        </div>
      )}

      {/* === 작은 알림 모달 === */}
      {alertMessage && (
        <div className="modal-backdrop" onClick={() => setAlertMessage("")}>
          <div className="alert-modal" onClick={(e) => e.stopPropagation()}>
            <p>{alertMessage}</p>
            <button onClick={() => setAlertMessage("")}>OK</button>
          </div>
        </div>
      )}

      <FindIdModal 
        show={showIdModal} 
        onClose={()=>setShowIdModal(false)} 
        onOpenPwModal={(id) => {
          setPwInitialId(id);
          setShowPwModal(true);
          setShowIdModal(false);
        }}
      />
      <FindPwModal 
        show={showPwModal} 
        onClose={()=>setShowPwModal(false)} 
        initialId={pwInitialId} 
      />
    </>
  );
}

export default Login;
