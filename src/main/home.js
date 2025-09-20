import React, { useState, useEffect } from 'react';
import styles from './home.css';
import '../commonness.css';
import { createGlobalStyle } from 'styled-components';

import Header from '../components/Header';

function MyHome() {
  const HomeStyle = createGlobalStyle`
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body{
      background-color: #e4e1da;
    }

    @media screen and (max-width: 767px) {
        body {
          overflow: hidden;
        }
      }
    
    @media screen and (max-width: 575px) {
      body {
        overflow: hidden;
      }
    }
  `;

  const [hoverText, setHoverText] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [currentBg, setCurrentBg] = useState(0);
  const [backgrounds, setBackgrounds] = useState([]); // 🔹 백엔드 이미지 저장

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  // 🔹 백엔드에서 최신 3개 이미지 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/posts/latest-images", {
      credentials: "include"
    })
      .then((res) => res.json())
      .then((data) => {
        // data = ["/images/aaa.jpg", "/images/bbb.png", ...]
        setBackgrounds(data);
      })
      .catch((err) => {
        console.error("이미지 불러오기 실패:", err);
      });
  }, []);

  // 5초마다 배경 자동 변경
  useEffect(() => {
    if (backgrounds.length === 0) return;
    const interval = setInterval(() => {
      setCurrentBg((prev) => (prev + 1) % backgrounds.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [backgrounds]);

  return (
    <>
      <HomeStyle />
      <Header />
      <div className="home-wrap">
        {/* Hero */}
        <div
          className="hero"
          style={{
            backgroundImage:
              backgrounds.length > 0
                ? `url(http://localhost:8080${backgrounds[currentBg]})`
                : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <a
            href="#"
            className="nav left"
            onClick={(e) => {
              e.preventDefault();
              setCurrentBg((prev) =>
                prev === 0 ? backgrounds.length - 1 : prev - 1
              );
            }}
          >
            <svg
              fill="none"
              className="rubicons chevron-left"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M15 6l-6 6 6 6" strokeLinecap="round"></path>
            </svg>
          </a>

          <a
            href="#"
            className="nav right"
            onClick={(e) => {
              e.preventDefault();
              setCurrentBg((prev) => (prev + 1) % backgrounds.length);
            }}
          >
            <svg
              fill="none"
              className="rubicons chevron-right"
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M9 18l6-6-6-6" strokeLinecap="round"></path>
            </svg>
          </a>
        </div>

        {/* Hover Text */}
        <div id="nav_big_text" className={hoverText ? "big_text_active" : ""}>
          {hoverText}
        </div>

        {/* Footer */}
        <footer>
          <div className="copyright">
            ©<span className="year">{year}</span> Pord Folio - All rights reserved.
          </div>
        </footer>
      </div>
    </>
  );
}

export default MyHome;
