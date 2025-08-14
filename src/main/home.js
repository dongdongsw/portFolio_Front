// const hamMenu = document.querySelector('.ham-menu');
// var navSlide = document.querySelector('.container .nav-class');

// hamMenu.addEventListener('click',() => {
//   if(navSlide.style.transform === 'translateY(100%) translateX(0px)'){
//     return navSlide.style.transform = 'translateY(100%) translateX(100%)'
//   }
//   navSlide.style.transform = 'translateY(100%) translateX(0)'
// })

import React, { useState } from 'react';
import styles from './home.css'; // 위에서 만든 CSS 모듈 불러오기

function MyHeader() {
  // 내비게이션 슬라이드가 열렸는지 닫혔는지 상태를 관리
  const [isNavOpen, setIsNavOpen] = useState(false);

  // 햄버거 메뉴 클릭 시 호출될 함수
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen); // isNavOpen 상태를 반전 (true <-> false)
  };

  return (
    // <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
    // <link href="https://fonts.googleapis.com/css2?family=Nunito:wght@200&display=swap" rel="stylesheet">
<section className="home-section"> {/* class 대신 className 사용 */}
  <header>
    <div className="container"> {/* class 대신 className 사용 */}
        <div className="logo"> {/* class 대신 className 사용 */}
      <h1>TOP HOUSE</h1>
    </div>
    <div className="ham-menu"> {/* class 대신 className 사용 */}
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
        <li><a href="#" className="active-link">HOME</a></li> {/* class 대신 className 사용 */}
        <li><a href="#">SERVICES</a></li>
        <li><a href="#">GALLERY</a></li>
        <li><a href="#">CONTACT US</a></li>
        <li><a href="#">ABOUT</a></li>
      </ul>
    </nav>
    <nav className="nav-class"> {/* class 대신 className 사용 */}
      <ul>
        <li><a href="#" className="active-link">HOME</a></li> {/* class 대신 className 사용 */}
        <li><a href="#">SERVICES</a></li>
        <li><a href="#">GALLERY</a></li>
        <li><a href="#">CONTACT US</a></li>
        <li><a href="#">ABOUT</a></li>
      </ul>
    </nav>
    </div>
  </header>
  <main>
    <div className="some-quote"> {/* class 대신 className 사용 */}
      <p>- stunning & elegant - </p>
    </div>
    <div className="design-btn"> {/* class 대신 className 사용 */}
      <h1>EXPLORE DESIGNS</h1>
    </div>
    <div className="navigation"> {/* class 대신 className 사용 */}
      <div className="next-prev"> {/* class 대신 className 사용 */}

{/* 여기부터 아래 코드가 user가 이어서 준 코드 */}

        <div>
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="24" height="24"
            viewBox="0 0 172 172"
            style={{ fill: '#000000' }}> {/* style 속성 수정 */}
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
      <div className="indicator"> {/* class 대신 className 사용 */}
        <div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </div>
  </main>
  <div className="home-footer"> {/* class 대신 className 사용 */}
    <div className="social-link-icon"> {/* class 대신 className 사용 */}
      <div>
              <div>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="22" height="22"
            viewBox="0 0 172 172"
            style={{ fill: 'rgba(0,0,0,0.8)' }}> {/* style 속성 수정 */}
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
              <path d="M0,172v-172h172v172z" fill="none"></path>
              <g fill="rgba(0,0,0,0.8)">
                <path d="M86,0c-47.49846,0 -86,38.50154 -86,86c0,43.11908 31.76046,78.71646 73.14631,84.93492v-62.14492h-21.28169v-22.60477h21.28169v-15.04338c0,-24.90692 12.13262,-35.83554 32.83215,-35.83554c9.90985,0 15.15585,0.73431 17.63662,1.07169v19.73369h-14.11723c-8.78523,0 -11.85477,8.32877 -11.85477,17.72262v12.35754h25.75369l-3.49292,22.60477h-22.26077v62.33015c41.97462,-5.70246 74.35692,-41.59092 74.35692,-85.12677c0,-47.49846 -38.50154,-86 -86,-86z"></path>
              </g>
            </g>
          </svg>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="22" height="22"
            viewBox="0 0 172 172"
            style={{ fill: 'rgba(0,0,0,0.8)' }}> {/* style 속성 수정 */}
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
              <path d="M0,172v-172h172v172z" fill="none"></path>
              <g fill="rgba(0,0,0,0.8)">
                <path d="M172,30.82226c-6.4388,2.85547 -12.9056,5.01107 -20.07226,5.73894c7.16667,-4.3112 12.9056,-11.47787 15.76107,-19.3724c-7.16667,4.31119 -14.33333,7.16667 -22.19988,8.6224c-7.16667,-7.16667 -16.48893,-11.47787 -26.51106,-11.47787c-19.3724,0 -35.13347,15.76107 -35.13347,35.10547c0,2.88346 0,5.73893 0.72786,7.89453c-29.39453,-1.42774 -55.17773,-15.06119 -72.39453,-36.56119c-3.58333,5.03906 -5.01107,11.47786 -5.01107,17.91667c0,12.20573 6.43881,22.95573 15.76107,29.39453c-5.73893,-0.72786 -11.44987,-2.1556 -15.76107,-4.31119c0,0 0,0 0,0.72786c0,17.18881 12.17774,31.52214 27.93881,34.4056c-2.85547,0.69988 -5.71094,1.42774 -9.29427,1.42774c-2.1556,0 -4.3112,0 -6.4668,-0.72786c4.31119,14.33333 17.2168,24.38346 32.97786,24.38346c-12.17773,9.32227 -27.23893,15.03321 -43.72786,15.03321c-2.85547,0 -5.73893,0 -8.5944,-0.69988c15.76107,10.02214 34.4056,15.76107 53.75,15.76107c65.22787,0 100.33333,-53.75 100.33333,-100.33333c0,-1.42774 0,-2.85547 0,-4.31119c7.16667,-5.01107 12.9056,-11.44988 17.91667,-18.61654"></path>
              </g>
            </g>
          </svg>
      </div>
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
            width="22" height="22"
            viewBox="0 0 172 172"
            style={{ fill: 'rgba(0,0,0,0.8)' }}> {/* style 속성 수정 */}
            <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}> {/* style 속성 및 camelCase로 변경 */}
              <path d="M0,172v-172h172v172z" fill="none">

              </path>
              <g fill="rgba(0,0,0,0.8)">
                <path d="M57.33333,21.5c-19.78717,0 -35.83333,16.04617 -35.83333,35.83333v57.33333c0,19.78717 16.04617,35.83333 35.83333,35.83333h57.33333c19.78717,0 35.83333,-16.04617 35.83333,-35.83333v-57.33333c0,-19.78717 -16.04617,-35.83333 -35.83333,-35.83333zM129,35.83333c3.956,0 7.16667,3.21067 7.16667,7.16667c0,3.956 -3.21067,7.16667 -7.16667,7.16667c-3.956,0 -7.16667,-3.21067 -7.16667,-7.16667c0,-3.956 3.21067,-7.16667 7.16667,-7.16667zM86,50.16667c19.78717,0 35.83333,16.04617 35.83333,35.83333c0,19.78717 -16.04617,35.83333 -35.83333,35.83333c-19.78717,0 -35.83333,-16.04617 -35.83333,-35.83333c0,-19.78717 16.04617,-35.83333 35.83333,-35.83333zM86,64.5c-11.87412,0 -21.5,9.62588 -21.5,21.5c0,11.87412 9.62588,21.5 21.5,21.5c11.87412,0 21.5,-9.62588 21.5,-21.5c0,-11.87412 -9.62588,-21.5 -21.5,-21.5z">

                </path>
              </g>
            </g>
          </svg>
      </div>
      </div>
    </div>
  </div>
</section>

      );
}

export default MyHeader;