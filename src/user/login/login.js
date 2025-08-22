import React, { useState } from 'react';
import './login.css'; 
import '../../commonness.css';
import { createGlobalStyle } from 'styled-components';
import FindIdModal from './find_login/find_id';
import FindPwModal from './find_login/find_pw';
import logo from './10.png'; 
function Login() {
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
    }
    html, body { overflow-x: hidden; }
    .title { font-size: 34px; font-weight: 700; line-height: 3; color: #6f6767; }

    .verification-container {
      display: flex;
      gap: 10px;
      margin-top: 10px;
    }
    .verification-container input {
      flex: 2;
    }
    .verification-container button {
      flex: 1;
    }
  `;

  // 로그인/회원가입 상태
  const [isSignInActive, setIsSignInActive] = useState(true);

  // 모달 상태
  const [showIdModal, setShowIdModal] = useState(false);
  const [showPwModal, setShowPwModal] = useState(false);
  const [pwInitialId, setPwInitialId] = useState("");

  // Sign In / Sign Up 전환
  const handleSignInClick = () => setIsSignInActive(true);
  const handleSignUpClick = () => setIsSignInActive(false);

  return (
    <>
      <GlobalStyle />
      
      <div className="login_main">
        {/* 회원가입 폼 */}
        <div className={`containers a-container ${isSignInActive ? 'is-txl' : ''}`}>
          <form className="login_form">
            <h2 className="form_title title">Create Account</h2>
            <span className="form__span">or use email for registration</span>
            <input className="form__input" type="text" placeholder="Name" />
            <input className="form__input" type="text" placeholder="Email" />
            <input className="form__input" type="password" placeholder="Password" />
            <button className="form__button button submit">SIGN UP</button>
          </form>
        </div>

        {/* 로그인 폼 */}
        <div className={`containers b-container ${!isSignInActive ? 'is-txl' : ''} ${isSignInActive ? 'is-z200' : ''}`}>
          <form className="login_form">
            <h2 className="form_title title">Sign in to Website</h2>
            <span className="form__span">or use your email account</span>
            <input className="form__input" type="text" placeholder="Email" />
            <input className="form__input" type="password" placeholder="Password" />
            <p className="form__link">
              Forgot your{" "}
              <a href="#" onClick={(e)=>{ e.preventDefault(); setShowIdModal(true); }}>
                ID
              </a>{" "}
              /{" "}
              <a href="#" onClick={(e)=>{ e.preventDefault(); setShowPwModal(true); }}>
                Password
              </a>?
            </p>
            <button className="form__button button submit">SIGN IN</button>
          </form>
        </div>

        {/* 스위치 패널 */}
        <div className={`switch ${!isSignInActive ? 'is-txr is-z200' : ''}`}>
          <div className="switch__circle"></div>
          <div className="switch__circle switch__circle--t"></div>
          <div className={`switch__container ${isSignInActive ? '' : 'is-hidden'}`}>
            <div className = "login-header">
        <a href="http://localhost:3000">
            <img src={logo} width="150" height="150" alt="logo" />
          </a>
      </div>
            <h2 className="switch__title title">Welcome Back !</h2>
            <p className="switch__description description">To keep connected with us please login with your personal info</p>
            <button className="switch__button button switch-btn" onClick={handleSignUpClick}>SIGN UP</button>
          </div>
          <div className={`switch__container ${!isSignInActive ? '' : 'is-hidden'}`}>
            <h2 className="switch__title title">Hello Friend !</h2>
            <p className="switch__description description">Enter your personal details and start journey with us</p>
            <button className="switch__button button switch-btn" onClick={handleSignInClick}>SIGN IN</button>
          </div>
        </div>
      </div>

      {/* 아이디 찾기 모달 */}
      <FindIdModal 
        show={showIdModal} 
        onClose={()=>setShowIdModal(false)} 
        onOpenPwModal={(id) => {
          setPwInitialId(id);
          setShowPwModal(true);
          setShowIdModal(false); // 🔹 FindPw로 넘어갈 때 ID 모달 닫기
        }}
      />

      {/* 비밀번호 찾기 모달 */}
      <FindPwModal 
        show={showPwModal} 
        onClose={()=>setShowPwModal(false)} 
        initialId={pwInitialId} 
      />
    </>
  );
}

export default Login;
