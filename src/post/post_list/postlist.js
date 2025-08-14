import React, { useMemo, useState } from "react";
import "./postlist.css";

export default function PostList() {
  const cards = useMemo(
    () =>
      Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        day: String(10 + ((i * 3) % 20)).padStart(2, "0"),
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"][i % 6],
        category: ["Photos", "Tech", "Travel"][i % 3],
        title: `Card Title #${i + 1}`,
        subtitle: "The city that never sleeps.",
        img:
          i % 2 === 0
            ? "https://s3-us-west-2.amazonaws.com/s.cdpn.io/169963/photo-1429043794791-eb8f26f44081.jpeg"
            : `https://picsum.photos/seed/post${i}/800/600`,
        description:
          "New York, the largest city in the U.S., is an architectural marvel with plenty of historic monuments, magnificent buildings and countless dazzling skyscrapers.",
      })),
    []
  );

  const PAGE_SIZE = 15; // 5열 × 3행
  const [page, setPage] = useState(1);
  const pageCount = Math.ceil(cards.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const current = cards.slice(start, start + PAGE_SIZE);

  const [hoverIdx, setHoverIdx] = useState(null);

  const goto = (p) => {
    if (p < 1 || p > pageCount) return;
    setPage(p);
    setHoverIdx(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const prevent = (e) => e.preventDefault();

  return (
    <>
      {/* 아이콘 (전역에 한 번만 있어도 됨) */}
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      {/* 모든 콘텐츠를 post-container 안에 배치 */}
      <div className="post-container">
        {/* ✅ 헤더: 고유 클래스 + 강한 inline 스타일로 항상 보이게 */}
        <div
          className="post-info"
          style={{
            display: "block",
            position: "relative",
            zIndex: 10000,
            background: "transparent",
          }}
        >
          <h1>PortFolio</h1>
          <span>postlist</span>
        </div>

        {/* 카드 그리드 (5열) */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gap: 40,
            justifyItems: "center",
            width: "100%",
          }}
        >
          {current.map((c, idx) => {
            const i = start + idx;
            const isHover = hoverIdx === i;
            return (
              <div key={c.id} style={{ width: 280 }}>
                <div
                  className={`post-module ${isHover ? "hover" : ""}`}
                  onMouseEnter={() => setHoverIdx(i)}
                  onMouseLeave={() => setHoverIdx(null)}
                >
                  <div className="thumbnail">
                    <div className="date">
                      <div className="day">{c.day}</div>
                      <div className="month">{c.month}</div>
                    </div>
                    <img src={c.img} alt={c.title} />
                  </div>

                  <div className="post-content">
                    <div className="category">{c.category}</div>
                    <h1 className="title">{c.title}</h1>
                    <h2 className="sub_title">{c.subtitle}</h2>
                    <p className="description">{c.description}</p>
                    <div className="post-meta">
                      <span className="timestamp">
                        <i className="fa fa-clock-o" /> 6 mins ago
                      </span>
                      <span className="comments">
                        <i className="fa fa-comments" />
                        <a href="#!" onClick={prevent}> 39 comments</a>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 페이징 */}
        <div className="pager">
          <button
            onClick={() => goto(page - 1)}
            disabled={page === 1}
            className={`pager-btn pager-arrow ${page === 1 ? "is-disabled" : ""}`}
            aria-label="Previous page"
          >
            ◀ Prev
          </button>

          {Array.from({ length: pageCount }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => goto(p)}
              className={`pager-btn ${p === page ? "is-active" : ""}`}
              aria-current={p === page ? "page" : undefined}
              aria-label={`Page ${p}`}
            >
              {p}
            </button>
          ))}

          <button
            onClick={() => goto(page + 1)}
            disabled={page === pageCount}
            className={`pager-btn pager-arrow ${page === pageCount ? "is-disabled" : ""}`}
            aria-label="Next page"
          >
            Next ▶
          </button>
        </div>
      </div>
    </>
  );
}
