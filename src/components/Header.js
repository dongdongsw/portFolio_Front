// Header.js
import React, { useState } from 'react';
import './Header.css'; // Header 전용 CSS 파일 불러오기
import logo from './10.png'; // 로고 이미지 (이 파일이 Header.js와 같은 폴더에 있다고 가정!)

function Header() {
  // 내비게이션 슬라이드가 열렸는지 닫혔는지 상태를 관리
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 햄버거 메뉴 클릭 시 호출될 함수
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // isNavOpen 상태를 반전 (true <-> false)
  };

  return (
    <header>
      <div className="home-container">
        <div className="logo">
          <img src={logo} width="150" height="150" alt="logo" />
          <button className="home-login">
            <a className="home-a">로그인</a>
          </button>
        </div>
        <div className="ham-menu" onClick={toggleNav}> {/* 햄버거 메뉴 클릭 이벤트 추가! */}
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
            <li className="home_li"><a href="#" className="active-link">HOME</a></li>
            <li className="home_li"><a href="#">게시판</a></li>
            <li className="home_li"><a href="#">CONTACT US</a></li>
            <li className="home_li"><a href="#">ABOUT</a></li>
          </ul>
        </nav>
        {/* isNavOpen 상태에 따라 클래스 추가 (나중에 애니메이션 연결 가능) */}
        <nav className={`nav-class ${isNavOpen ? 'is-open' : ''}`}>
          <ul>
            <li className="home_li"><a href="#" className="active-link">HOME</a></li>
            <li className="home_li"><a href="#">SERVICES</a></li>
            <li className="home_li"><a href="#">CONTACT US</a></li>
            <li className="home_li"><a href="#">ABOUT</a></li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;