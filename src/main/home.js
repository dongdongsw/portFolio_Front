// home.js
import React from 'react'; // useState는 이제 Header.js로 이동!
import styles from './home.css'; 
import '../commonness.css';
import { createGlobalStyle } from 'styled-components';

import MainBg from './11.jpg'; // <-- 여기에 실제 경로와 파일명을 입력!

function MyHeader() {
  const HomeStyle = createGlobalStyle`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body{
      background-color: #e4e1da;
    }
  `;

  return (
    <>
      <HomeStyle />
      <Header />

      
      <section className="home-section">
        

        <main className="home_main"
          // 여기! style 속성으로 background-image를 동적으로 넣어줄 거야!
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${MainBg})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat'
          }}>
          <div className="some-quote">
            <p>- stunning & elegant - </p>
          </div>
          <div className="design-btn">
            <h1>EXPLORE DESIGNS</h1>
          </div>
          <div className="navigation">
            <div className="next-prev">
              <div>
                <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px"
                  width="24" height="24"
                  viewBox="0 0 172 172"
                  style={{ fill: '#000000' }}>
                  <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
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
                  style={{ fill: '#000000' }}>
                  <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
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