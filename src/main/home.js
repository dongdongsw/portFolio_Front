import React, {useState} from 'react'; 
import styles from './home.css'; 
import '../commonness.css';
import { createGlobalStyle } from 'styled-components';

import Header from '../components/Header';
import MainBg1 from './11.jpg';
import MainBg2 from './12.png';
import MainBg3 from './13.jpg'; 
const backgrounds = [MainBg1, MainBg2, MainBg3]; 

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
  const [currentSlide, setCurrentSlide] = useState(0); 
  const [slideDirection, setSlideDirection] = useState('right'); 

  const handleNext = () => {
    setSlideDirection('right'); 
    setCurrentSlide((prevSlide) => (prevSlide + 1) % backgrounds.length);
  };

  const handlePrev = () => {
    setSlideDirection('left'); 
    setCurrentSlide((prevSlide) =>
      prevSlide === 0 ? backgrounds.length - 1 : prevSlide - 1
    );
  };

  const goToSlide = (index) => {
    if (index > currentSlide) {
      setSlideDirection('right'); 
    } else if (index < currentSlide) {
      setSlideDirection('left'); 
    }
    setCurrentSlide(index);
  };

  return (
    <>
      <HomeStyle />
      <Header />
<section className="home-section">
      <main
        className={`home_main ${slideDirection === 'right' ? 'slide-right' : 'slide-left'}`} 
        key={currentSlide} 
        style={{
          backgroundImage: `linear-gradient(to right, rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4)), url(${backgrounds[currentSlide]})`,
        }}
      >
        <div className="some-quote">
          <p>- stunning & elegant - </p>
        </div>
        <div className="design-btn">
          <h1>Port Folio</h1>
        </div>
        <div className="navigation">
          <div className="next-prev">
            <div onClick={handlePrev}> 
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 172 172" style={{ fill: '#000000', cursor: 'pointer' }}>
                <g fill="none" fillRule="nonzero" stroke="none" strokeWidth="1" strokeLinecap="butt" strokeLinejoin="miter" strokeMiterlimit="10" strokeDasharray="" strokeDashoffset="0" fontFamily="none" fontWeight="none" fontSize="none" textAnchor="none" style={{ mixBlendMode: 'normal' }}>
                  <path d="M0,172v-172h172v172z" fill="none"></path>
                  <g fill="#ffffff">
                    <path d="M97.46667,17.2h11.46667c2.21307,0 4.2312,1.27853 5.18293,3.27947c0.95173,2.00093 0.65933,4.3688 -0.74533,6.0888l-48.63013,59.43173l48.63013,59.43747c1.40467,1.71427 1.69133,4.08213 0.74533,6.0888c-0.946,2.00667 -2.96987,3.27373 -5.18293,3.27373h-11.46667c-1.72,0 -3.34827,-0.774 -4.4376,-2.10413l-51.6,-63.06667c-1.72573,-2.1156 -1.72573,-5.14853 0,-7.26413l51.6,-63.06667c1.08933,-1.3244 2.7176,-2.0984 4.4376,-2.0984z"></path>
                  </g>
                </g>
              </svg>
            </div>
            <div onClick={handleNext}> 
              <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24" height="24" viewBox="0 0 172 172" style={{ fill: '#000000', cursor: 'pointer' }}>
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
              {backgrounds.map((_, index) => (
                <div
                  key={index} 
                  onClick={() => goToSlide(index)}
                  style={{
                    width: '10px',
                    height: '10px',
                    borderRadius: '50%',
                    backgroundColor: index === currentSlide ? 'white' : 'gray', 
                    margin: '0 5px',
                    cursor: 'pointer',
                    display: 'inline-block'
                  }}
                ></div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </section>
    </>
  );
}

export default MyHeader;