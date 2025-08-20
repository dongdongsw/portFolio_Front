

import React, { useState } from 'react';
import styles from './home.css'; // 위에서 만든 CSS 모듈 불러오기
import '../commonness.css';
import { createGlobalStyle } from 'styled-components';
import logo from './10.png';

function MyHeader() {
  const HomeStyle = createGlobalStyle`
      * {
  margin: 0;
  padding: 0;
  box-sizing: border-box; /* 여기 0에서 border-box로 수정했어! */
}
  body{
  background-color: #e4e1da;
  }
    `;
  // 내비게이션 슬라이드가 열렸는지 닫혔는지 상태를 관리
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 햄버거 메뉴 클릭 시 호출될 함수
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // isNavOpen 상태를 반전 (true <-> false)
  };

  return (
    <>
    <HomeStyle/>
    
    {/* // <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    // <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200&display=swap" rel="stylesheet"> */}
<section className="home-section"> 
  <header>
    <div className="home-container"> 
        <div className="logo"> 
    <img src={logo} width="150" height="150" alt="logo" />
      <button className="home-login" x="200px" y="500px">
        <a className="home-a">
      로그인
      </a>
    </button>
    </div>
    <div className="ham-menu"> 
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="25" height="25"
            viewBox="0 0 172 172"
            style={{ fill: '#000000' }}> {/* style 속성 수정 */}
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
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
        <li className = "home_li"><a href="#" className="active-link">HOME</a></li>
        <li className = "home_li"><a href="#">게시판</a></li>
        <li className = "home_li"><a href="#">CONTACT US</a></li>
        <li className = "home_li"><a href="#">ABOUT</a></li>
      </ul>
    </nav>
    <nav className="nav-class"> 
      <ul>
        <li className = "home_li"><a href="#" className="active-link">HOME</a></li> 
        <li className = "home_li"><a href="#">SERVICES</a></li>
        <li className = "home_li"><a href="#">CONTACT US</a></li>
        <li className = "home_li"><a href="#">ABOUT</a></li>
      </ul>
    </nav>
    
    </div>
  </header>
  <main className="home_main">
    <div className="some-quote"> 
      <p>- stunning & elegant - </p>
    </div>
    <div className="design-btn"> 
      <h1>EXPLORE DESIGNS</h1>
    </div>
    <div className="navigation"> 
      <div className="next-prev"> 

{/* 여기부터 아래 코드가 user가 이어서 준 코드 */}

        <div>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="24" height="24"
            viewBox="0 0 172 172"
            style={{ fill: '#000000' }}> 
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
              <path d="M0,172v-172h172v172z" fill="none"></path>
              <g fill="#ffffff">
                <path d="M97.46667,17.2h11.46667c2.21307,0 4.2312,1.27853 5.18293,3.27947c0.95173,2.00093 0.65933,4.3688 -0.74533,6.0888l-48.63013,59.43173l48.63013,59.43747c1.40467,1.71427 1.69133,4.08213 0.74533,6.0888c-0.946,2.00667 -2.96987,3.27373 -5.18293,3.27373h-11.46667c-1.72,0 -3.34827,-0.774 -4.4376,-2.10413l-51.6,-63.06667c-1.72573,-2.1156 -1.72573,-5.14853 0,-7.26413l51.6,-63.06667c1.08933,-1.3244 2.7176,-2.0984 4.4376,-2.0984z"></path>
              </g>
            </g>
          </svg>
        </div>
        <div>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="24" height="24"
            viewBox="0 0 172 172"
            style={{ fill: '#000000' }}> {/* style 속성 수정 */}
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
              <path d="M0,172v-172h172v172z" fill="none"></path>
              <g fill="#ffffff">
                <path d="M68.8,154.8h-11.46667c-2.21307,0 -4.2312,-1.27853 -5.18293,-3.27947c-0.95173,-2.00093 -0.65933,-4.3688 0.74533,-6.0888l48.63013,-59.43173l-48.63013,-59.43747c-1.40467,-1.71427 -1.69133,-4.08213 -0.74533,-6.0888c0.946,-2.00667 2.96987,-3.27373 5.18293,-3.27373h11.46667c1.72,0 3.34827,0.774 4.4376,2.10413l51.6,63.06667c1.72573,2.1156 1.72573,5.14853 0,7.26413l-51.6,63.06667c-1.08933,1.3244 -2.7176,2.0984 -4.4376,2.0984z"></path>
              </g>
            </g>
          </svg>
        </div>
      </div>
      <div className="indicator"> 
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </main>
  
    
  
</section>
</>
      );
}

export default MyHeader;