import React, { useState } from 'react';
import './login.css'; 
import '../../commonness.css';
import { Link } from "react-router-dom";
import { createGlobalStyle } from 'styled-components';
import FindIdModal from './find_login/find_id';
import FindPwModal from './find_login/find_pw';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import logo from './10.png'; // 로고 이미지 추가

function Login() {
  const navigate = useNavigate();

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
    .verification-container input {
      flex: 2;
    }
    .verification-container button {
      flex: 1;
    }
  `;

  const [isSignInActive, setIsSignInActive] = useState(true);

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

  const handleSignupChange = (e) => {
    setSignupData({ ...signupData, [e.target.name]: e.target.value });
  };
  const handleLoginChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  // 회원가입 제출
  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/create",
        signupData,
        { withCredentials: true }
      );
      alert(response.data);
      // 회원가입 성공 후 Home으로 이동
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "회원가입 실패");
    }
  };

  // 로그인 제출
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/login",
        loginData,
        { withCredentials: true }
      );
      alert(response.data);
      // 로그인 성공 시 Home으로 이동
      navigate('/');
    } catch (err) {
      console.error(err);
      alert(err.response?.data || "로그인 실패");
    }
  };

  const handleSignInClick = () => setIsSignInActive(true);
  const handleSignUpClick = () => setIsSignInActive(false);

  return (
    <>
      <GlobalStyle />

      <div className="login_main">
        <div className={`containers a-container ${isSignInActive ? 'is-txl' : ''}`}>
          <form className="login_form" onSubmit={handleSignupSubmit}>
            <h2 className="form_title title">Create Account</h2>
            <span className="form__span">or use email for registration</span>
            <input
              className="form__input"
              type="text"
              placeholder="ID"
              name="loginid"
              value={signupData.loginid}
              onChange={handleSignupChange}
            />
            <input
              className="form__input"
              type="text"
              placeholder="Email"
              name="email"
              value={signupData.email}
              onChange={handleSignupChange}
            />
            <input
              className="form__input"
              type="password"
              placeholder="Password"
              name="loginpw"
              value={signupData.loginpw}
              onChange={handleSignupChange}
            />
            <input
              className="form__input"
              type="text"
              placeholder="Nickname"
              name="nickname"
              value={signupData.nickname}
              onChange={handleSignupChange}
            />
            <button type="submit" className="form__button button submit">SIGN UP</button>
          </form>
        </div>

        <div className={`containers b-container ${!isSignInActive ? 'is-txl' : ''} ${isSignInActive ? 'is-z200' : ''}`}>
          <form className="login_form" onSubmit={handleLoginSubmit}>
            <h2 className="form_title title">Sign in to Website</h2>
            <span className="form__span">or use your email account</span>
            <input
              className="form__input"
              type="text"
              placeholder="ID"
              name="loginid"
              value={loginData.loginid}
              onChange={handleLoginChange}
            />
            <input
              className="form__input"
              type="password"
              placeholder="Password"
              name="loginpw"
              value={loginData.loginpw}
              onChange={handleLoginChange}
            />
            <p className="form__link">
              Forgot your{" "}
              <button type="button" onClick={() => setShowIdModal(true)}>ID</button>{" "}
              /{" "}
              <button type="button" onClick={() => setShowPwModal(true)}>Password</button>?
            </p>
            <button type="submit" className="form__button button submit">SIGN IN</button>
          </form>
        </div>

        <div className={`switch ${!isSignInActive ? 'is-txr is-z200' : ''}`}>
          <div className="switch__circle"></div>
          <div className="switch__circle switch__circle--t"></div>
          <div className={`switch__container ${isSignInActive ? '' : 'is-hidden'}`}>
            <div className="logo-login">
              <Link to="/" className="logo-login-text">Port Folio</Link>
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
