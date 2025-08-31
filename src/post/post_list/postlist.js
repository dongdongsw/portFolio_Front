// src/post/post_list/postlist.js
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./postlist.css";
import { createGlobalStyle } from "styled-components";
import Header from "../../components/Header";
import { fetchPosts } from "../../api/postApi";
import defaultThumb from "../../main/10.png"; // ✅ 업로드 없는 경우 사용할 기본 썸네일

export default function PostList() {
  const PostListStyle = createGlobalStyle`
    html, body {
      margin: 0;
      padding: 0;
      min-height: 100%;
      overflow-y: auto;
      overflow-x: hidden;
      background-color: #e4e1da;
      color: #6f6767;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
    }
    header { margin-bottom: 50px; }
  `;

  const navigate = useNavigate();

  // 서버에서 받아온 게시글
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 최초 로드
  useEffect(() => {
    (async () => {
      try {
        const data = await fetchPosts(); // GET /api/posts
        setPosts(Array.isArray(data) ? data : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const PAGE_SIZE = 12; // 4열 × 3행
  const [page, setPage] = useState(1);

  // 날짜 포맷
  const formatDate = (d) => {
    if (!d) return "";
    const dt = new Date(d);
    const pad = (n) => String(n).padStart(2, "0");
    return `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())} ${pad(dt.getHours())}:${pad(dt.getMinutes())}`;
  };

  // 최신글이 위로: 업로드일 > id 내림차순
  const ordered = useMemo(() => {
    return [...posts].sort((a, b) => {
      const ad = new Date(a?.uploaddate || 0).getTime();
      const bd = new Date(b?.uploaddate || 0).getTime();
      if (bd !== ad) return bd - ad;
      return (b?.id || 0) - (a?.id || 0);
    });
  }, [posts]);

  const pageCount = Math.ceil(ordered.length / PAGE_SIZE) || 1;
  const start = (page - 1) * PAGE_SIZE;
  const current = ordered.slice(start, start + PAGE_SIZE);

  const [hoverIdx, setHoverIdx] = useState(null);
  const goto = (p) => {
    if (p < 1 || p > pageCount) return;
    setPage(p);
    setHoverIdx(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prevent = (e) => e.preventDefault();

  if (loading) {
    return (
      <>
        <PostListStyle />
        <Header />
        <div style={{ padding: 24 }}>불러오는 중…</div>
      </>
    );
  }

  return (
    <>
      <PostListStyle />
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css"
      />

      <div className="header">
        <Header />
      </div>

      {/* 글 작성 FAB */}
      <button
        className="fab-btn"
        onClick={() => navigate("/create")}
        aria-label="글 작성"
        title="글 작성"
      >
        <i className="fa fa-pencil" aria-hidden="true" />
      </button>

      <div className="post-container">
        <div className="content-60">
          {/* 4열 × 250px 그리드 */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 250px)",
              columnGap: 40,
              rowGap: 30,
              justifyContent: "center",
              width: "100%",
            }}
          >
            {current.map((p, idx) => {
              const i = start + idx;
              const isHover = hoverIdx === i;

              // ✅ 업로드 이미지가 하나라도 있으면 그걸 사용, 없으면 기본 썸네일 사용
              const uploadedThumb =
                p?.imagepath0 || p?.imagepath1 || p?.imagepath2 || p?.imagepath3 || p?.imagepath4 || null;
              const thumb = uploadedThumb || defaultThumb; // 외부 링크 절대 사용 X

              const title = p?.title || "(제목 없음)";
              const author = p?.nickname || p?.loginid || "작성자";
              const createdAt = formatDate(p?.uploaddate || p?.modifydate);

              return (
                <div key={p?.id ?? i}>
                  <div
                    className={`post-module ${isHover ? "hover" : ""}`}
                    onMouseEnter={() => setHoverIdx(i)}
                    onMouseLeave={() => setHoverIdx(null)}
                    onClick={() => navigate(`/postlist/postdetail/${p?.id}`)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="thumbnail">
                      <div className="date">
                        <div className="day">{String(new Date(p?.uploaddate || p?.modifydate || Date.now()).getDate()).padStart(2, "0")}</div>
                        <div className="month">{["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][new Date(p?.uploaddate || p?.modifydate || Date.now()).getMonth()]}</div>
                      </div>
                      <img src={thumb} alt={title} />
                    </div>

                    <div className="post-content">
                      <h1 className="title">{title}</h1>
                      <h2 className="sub_title">{author}</h2>
                      <p className="description">{createdAt}</p>
                      <div className="post-meta">
                        <span className="views">
                          <i className="fa fa-eye" aria-hidden="true" /> {p?.viewcount ?? 0} views
                        </span>
                        {"  "} | {"  "}
                        <span className="comments">
                          <i className="fa fa-comments" aria-hidden="true" />{" "}
                          <a href="#!" onClick={prevent}>
                            {p?.commentsCount ?? 0} comments
                          </a>
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

            {Array.from({ length: pageCount }, (_, i) => i + 1).map((pnum) => (
              <button
                key={pnum}
                onClick={() => goto(pnum)}
                className={`pager-btn ${pnum === page ? "is-active" : ""}`}
                aria-current={pnum === page ? "page" : undefined}
                aria-label={`Page ${pnum}`}
              >
                {pnum}
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
      </div>
    </>
  );
}
