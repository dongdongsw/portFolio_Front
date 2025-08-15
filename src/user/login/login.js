import React, { useState } from 'react';
// CSS 파일은 보통 이렇게 import 해서 사용해!
import './login.css'; 
import '../../commonness.css';
import { createGlobalStyle } from 'styled-components';

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
    `;

  // 로그인(true) 또는 회원가입(false) 상태를 관리하는 state
  const [isSignInActive, setIsSignInActive] = useState(true); // 처음엔 로그인 폼이 보이도록 true

  const handleSignInClick = () => {
    setIsSignInActive(true);
  };

  const handleSignUpClick = () => {
    setIsSignInActive(false);
  };


  return (
    <>
    <GlobalStyle />
    <div className="login_main">
      
      {/* 회원가입 폼: a-container */}
      {/* isSignInActive가 true일 때 (로그인 폼이 활성화될 때), 회원가입 폼은 왼쪽으로 밀려나고(is-txl) z-index가 낮아짐 */}
      <div className={`containers a-container ${isSignInActive ? 'is-txl' : ''}`} id="a-container">
        <form id="a-form" className="login_form" method="" action="">
          <h2 className="form_title title">Create Account</h2>

          <span className="form__span">or use email for registration</span>
          <input className="form__input" type="text" placeholder="Name" />
          <input className="form__input" type="text" placeholder="Email" />
          <input className="form__input" type="password" placeholder="Password" />
          <button className="form__button button submit">SIGN UP</button>
        </form>
      </div>

      {/* 로그인 폼: b-container */}
      {/* isSignInActive가 false일 때 (회원가입 폼이 활성화될 때), 로그인 폼은 왼쪽으로 밀려나고(is-txl) z-index가 낮아짐 */}
      {/* 로그인 폼이 활성화되면 is-z200 클래스로 z-index를 높여 앞으로 보냄 */}
      <div className={`containers b-container ${!isSignInActive ? 'is-txl' : ''} ${isSignInActive ? 'is-z200' : ''}`} id="b-container">
        <form id="b-form" className="login_form" method="" action="">
          <h2 className="form_title title">Sign in to Website</h2>
          

          <span className="form__span">or use your email account</span>
          <input className="form__input" type="text" placeholder="Email" />
          <input className="form__input" type="password" placeholder="Password" />
          {/*href에 넘어갈 페이지 링크 넣어줄것임*/ }
          <a className="form__link" href="#">Forgot your password?</a>
          <button className="form__button button submit">SIGN IN</button>
        </form>
      </div>

      {/* 스위치 패널 */}
      {/* isSignInActive가 false일 때 (회원가입 폼이 활성화될 때), 스위치 패널은 오른쪽으로 이동하고(is-txr) z-index가 높아짐(is-z200) */}
      <div className={`switch ${!isSignInActive ? 'is-txr is-z200' : ''}`} id="switch-cnt">
        <div className="switch__circle"></div>
        <div className="switch__circle switch__circle--t"></div>

        {/* Welcome Back (Sign In 버튼) - isSignInActive가 true일 때만 보이도록 */}
        <div className={`switch__container ${isSignInActive ? '' : 'is-hidden'}`} id="switch-c1">
          <h2 className="switch__title title">Welcome Back !</h2>
          <p className="switch__description description">To keep connected with us please login with your personal info</p>
          <button className="switch__button button switch-btn" onClick={handleSignUpClick}>SIGN UP</button>
        </div>

        {/* Hello Friend (Sign Up 버튼) - isSignInActive가 false일 때만 보이도록 */}
        <div className={`switch__container ${!isSignInActive ? '' : 'is-hidden'}`} id="switch-c2">
          <h2 className="switch__title title">Hello Friend !</h2>
          <p className="switch__description description">Enter your personal details and start journey with us</p>
          <button className="switch__button button switch-btn" onClick={handleSignInClick}>SIGN IN</button>
        </div>
      </div>
    </div>
    </>
  );
}

export default Login;