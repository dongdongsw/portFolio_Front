// Header.js
import React, { useState } from 'react';
import './Header.css'; 
import logo from './10.png'; 

function Header() {


  const [isNavOpen, setIsNavOpen] = useState(false);

  // 햄버거 메뉴 클릭 시 호출될 함수
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // isNavOpen 상태를 반전 (true <-> false)
  };

  return (
    <header>
      <div className="home-container" >
        <div className="logo">
          <a href="http://localhost:3000">
            <img src={logo} width="150" height="150" alt="logo" />
          </a>
          
        </div>
        <div className="ham-menu" onClick={toggleNav}> 
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="25" height="25" viewBox="0 0 172 172" style={{ fill: '#000000' }}>
              <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
                <path d="M0,172v-172h172v172z" fill="none"></path>
                <g fill="#000000">
                  <path d="M10.32,30.96c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h151.36c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM10.32,82.56c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h151.36c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058zM10.32,134.16c-1.24059,-0.01754 -2.39452,0.63425 -3.01993,1.7058c-0.62541,1.07155 -0.62541,2.39684 0,3.46839c0.62541,1.07155 1.77935,1.72335 3.01993,1.7058h151.36c1.24059,0.01754 2.39452,-0.63425 3.01993,-1.7058c0.62541,-1.07155 0.62541,-2.39684 0,-3.46839c-0.62541,-1.07155 -1.77935,-1.72335 -3.01993,-1.7058z"></path>
                </g>
              </g>
            </svg>
          </div>
        </div>
        <nav>
          <ul>
            <li className="home_li"><a href="http://localhost:3000/postlist">게시판</a></li>
            <li className="home_li"><a href="#">CONTACT US</a></li>
            <li className="home_li"><a href="#">ABOUT</a></li>
            <li className="home_li"><a href="#">ABOUT</a></li>
            <li className="home_li"><a href="http://localhost:3000/login">로그인</a></li>
            <li className="home_li"><a href="http://localhost:3000/mypage">마이페이지</a></li>



            {/* <button className="home-login">
            <a className="home-a"  href="http://localhost:3000/login">로그인</a>
          </button>
          <button className="home-mypage">
            <a className="home-a"  href="http://localhost:3000/mypage">마이페이지</a>
          </button> */}
          </ul>
        </nav>
        {/* isNavOpen 상태에 따라 클래스 추가 (나중에 애니메이션 연결 가능) */}
        <nav className={`nav-class ${isNavOpen ? 'is-open' : ''}`}>
          <ul>
            <li className="home_li"><a href="http://localhost:3000/postlist">SERVICES</a></li>
            <li className="home_li"><a href="#">CONTACT US</a></li>
            <li className="home_li"><a href="#">ABOUT</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;