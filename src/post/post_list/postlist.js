import React, { useState } from "react";
import "./postlist.css"; // 위 CSS 임포트

export default function PostList() {
  // 첫 번째 카드: 마우스 진입/이탈 시 .hover 클래스 토글
  const [hover1, setHover1] = useState(false);

  const prevent = (e) => e.preventDefault();

  return (
    <>
      {/* 폰트어썸 아이콘 사용 시 (public/index.html <head>에 한 번만 추가해도 됨) */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <div className="container">
        {/* Pen Info */}
        <div className="info">
          <h1>Article News Card</h1>
          <span>
            Made with <i className="fa fa-heart animated infinite pulse" /> by{" "}
            <a href="http://andy.design" target="_blank" rel="noreferrer">
              Andy Tran
            </a>{" "}
            | Designed by{" "}
            <a href="http://justinkwak.com" target="_blank" rel="noreferrer">
              JustinKwak
            </a>
          </span>
        </div>

        {/* Normal Demo */}
        <div className="column">
          <div className="demo-title">Normal</div>

          {/* Post (호버 시 .hover 클래스 토글) */}
          <div
            className={`post-module ${hover1 ? "hover" : ""}`}
            onMouseEnter={() => setHover1(true)}
            onMouseLeave={() => setHover1(false)}
          >
            {/* Thumbnail */}
            <div className="thumbnail">
              <div className="date">
                <div className="day">27</div>
                <div className="month">Mar</div>
              </div>
              <img
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/photo-1429043794791-eb8f26f44081.jpeg"
                alt="City Lights in New York"
              />
            </div>

            {/* Post Content */}
            <div className="post-content">
              <div className="category">Photos</div>
              <h1 className="title">City Lights in New York</h1>
              <h2 className="sub_title">The city that never sleeps.</h2>
              <p className="description">
                New York, the largest city in the U.S., is an architectural
                marvel with plenty of historic monuments, magnificent buildings
                and countless dazzling skyscrapers.
              </p>
              <div className="post-meta">
                <span className="timestamp">
                  <i className="fa fa-clock-o" /> 6 mins ago
                </span>
                <span className="comments">
                  <i className="fa fa-comments" />
                  <a href="#!" onClick={prevent}>
                    {" "}
                    39 comments
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Demo — 항상 열린 상태(.post-module.hover) */}
        <div className="column">
          <div className="demo-title">Hover</div>

          <div className="post-module hover">
            <div className="thumbnail">
              <div className="date">
                <div className="day">27</div>
                <div className="month">Mar</div>
              </div>
              <img
                src="https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/photo-1429043794791-eb8f26f44081.jpeg"
                alt="City Lights in New York"
              />
            </div>

            <div className="post-content">
              <div className="category">Photos</div>
              <h1 className="title">City Lights in New York</h1>
              <h2 className="sub_title">The city that never sleeps.</h2>
              <p className="description">
                New York, the largest city in the U.S., is an architectural
                marvel with plenty of historic monuments, magnificent buildings
                and countless dazzling skyscrapers.
              </p>
              <div className="post-meta">
                <span className="timestamp">
                  <i className="fa fa-clock-o" /> 6 mins ago
                </span>
                <span className="comments">
                  <i className="fa fa-comments" />
                  <a href="#!" onClick={prevent}>
                    {" "}
                    39 comments
                  </a>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
