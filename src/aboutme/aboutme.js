import React, { useState, useEffect, useRef } from "react";
import "./aboutme.css";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { createGlobalStyle } from "styled-components";
import img1 from "./1.jpg";
import img2 from "./2.jpg";
import img3 from "./3.jpg";
import img4 from "./4.jpg";
import img5 from "./5.jpg";
import Header from "../components/Header";

const slides = [
  { img: img1, title: "Lorem P. Ipsum", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { img: img2, title: "Mr. Lorem Ipsum", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
  { img: img3, title: "Lorem Ipsum", text: "Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua." },
  { img: img4, title: "Lorem De Ipsum", text: "Ut enim ad minim veniam, quis nostrud exercitation ullamco." },
  { img: img5, title: "Ms. Lorem R. Ipsum", text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit." },
];

function Testim() {
  const AboutMeStyle = createGlobalStyle`
    *,
    *:after,
    *:before {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      user-select: none;
      cursor: default;
    }
    html, body {
      width: 100%;
      height: auto;
    }
    body {
      font-size: 16px;
      font-family: "Dubai-Light", sans-serif;
      background: #e4e1da;
    }
  `;

  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [direction, setDirection] = useState("next"); 
  const slideInterval = useRef(null);
  const speed = 4500;

  useEffect(() => {
    startAutoSlide();
    return () => stopAutoSlide();
  }, [current]);

  const startAutoSlide = () => {
    stopAutoSlide();
    slideInterval.current = setTimeout(() => {
      nextSlide();
    }, speed);
  };

  const stopAutoSlide = () => {
    if (slideInterval.current) clearTimeout(slideInterval.current);
  };

  const goToSlide = (index) => {
    setPrev(current);
    setDirection(index > current ? "next" : "prev");
    setCurrent(index);
  };

  const prevSlide = () => {
    setPrev(current);
    setDirection("prev");
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const nextSlide = () => {
    setPrev(current);
    setDirection("next");
    setCurrent((prev) => (prev + 1) % slides.length);
  };


  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 30) nextSlide();
    if (diff < -30) prevSlide();
  };

  return (
    <>
      <AboutMeStyle />
      <Header />
      <section
        id="testim"
        className="testim"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div className="wrap">
          <span className="arrow left" onClick={prevSlide}>
            <FaChevronLeft />
          </span>
          <span className="arrow right" onClick={nextSlide}>
            <FaChevronRight />
          </span>

          <div id="testim-content" className="cont">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={
                  index === current
                    ? "slide active"
                    : index === prev
                    ? `slide exit ${direction}`
                    : "slide"
                }
              >
                <div className="img">
                  <img src={slide.img} alt={slide.title} />
                </div>
                <h2>{slide.title}</h2>
                <p>{slide.text}</p>
              </div>
            ))}
          </div>

          <ul id="testim-dots" className="dots">
            {slides.map((_, index) => (
              <li
                key={index}
                className={`dot ${index === current ? "active" : ""}`}
                onClick={() => goToSlide(index)}
              ></li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}

export default Testim;
