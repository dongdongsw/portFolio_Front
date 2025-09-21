import React, { useState, useRef, useEffect } from "react";
import "./comment.css";
import { createGlobalStyle } from 'styled-components';
import { useNavigate } from "react-router-dom";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
  headers: { "Content-Type": "application/json" },
  withCredentials: true
});

const CommentStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; 
      -webkit-box-sizing: border-box;
 	    -moz-box-sizing: border-box;
    }

    comments-app, comments, dropdown-backdrop, delete-confirm-modal , auth-modal { background-color: #dee1e3; font-family: "Roboto", "Tahoma", "Arial", sans-serif; }
`;

function CommentsApp() {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [comment, setComment] = useState({ text: "", author: "", });
  const [comments, setComments] = useState([]);
  //   { id: 1, text: "댓글", author: "CHEOLWOO", authorId: "user-1", createdAt: new Date("2025-07-21T09:00:00"), displayedAt: new Date("2025-07-21T09:00:00") }, 
  //   { id: 2, text: "팀장/마이페이지", author: "DONGHYUN", authorId: "user-2", createdAt: new Date("2025-07-21T10:00:00"), displayedAt: new Date("2025-07-21T10:00:00") },
  //   { id: 3, text: "부팀장/로그인", author: "JUSEOP", authorId: "user-3", createdAt: new Date("2025-07-21T11:00:00"), displayedAt: new Date("2025-07-21T11:00:00") },
  //   { id: 4, text: "게시판1", author: "JAEHYUN", authorId: "user-4", createdAt: new Date("2025-07-21T12:00:00"), displayedAt: new Date("2025-07-21T12:00:00") },
  //   { id: 5, text: "게시판2", author: "MINSEOK", authorId: "user-5", createdAt: new Date("2025-07-21T13:00:00"), displayedAt: new Date("2025-07-21T13:00:00") }
  // ]);
  const path = typeof window !== "undefined" ? window.location.pathname : "";
  const parts = path.split("/").filter(Boolean);
  const last = parts[parts.length - 1] || "";
  const POST_ID = /^\d+$/.test(last) ? Number(last) : null;
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null);
  
  const [currentNickname, setCurrentNickname] = useState("");
  const [isMember, setIsMember] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");

  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const closeGuardRef = useRef(false);
  const navigate = useNavigate();

  const [originalOpenIndex, setOriginalOpenIndex] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/user/me");
        setCurrentNickname(data.nickname || "");
        setCurrentUserId((data.loginId ?? data.login_id ?? data.userId ?? data.id) || "");
        setIsMember(true);
      }
      catch (err) {
        setIsMember(false);
        console.error("GET /user/me failed", err);
      }
    };
    fetchProfile();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60 * 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      if (!Number.isFinite(POST_ID)) return;
      try {
        const { data } = await api.get(`/comments/post/${POST_ID}`);
        const mapped = (data || []).map(c => ({
          id: c.id,
          text: c.content,
          author: c.nickname,
          authorId: c.loginId,
          createdAt: c.uploadDate ? new Date(c.uploadDate) : null,
          displayedAt: c.displayedAt ? new Date(c.displayedAt)
                    : (c.modifyDate ? new Date(c.modifyDate)
                    : (c.uploadDate ? new Date(c.uploadDate) : null)),
        }));
        mapped.sort((a, b) => (b.displayedAt ?? 0) - (a.displayedAt ?? 0));
        setComments(mapped);
      } catch (err) {
        console.error("GET /comments/post failed", err);
      }
    };
    setComments([]);   
    fetchComments();
  }, [POST_ID]);
  
  useEffect(() => {
    if (openMenuIndex === null) return;
    closeGuardRef.current = false;
    const enableGuard = setTimeout(() => { closeGuardRef.current = true; }, 0);
    const ac = new AbortController();
    const { signal } = ac;

    const handlePointerDown = (e) => {
      if (!closeGuardRef.current) return;
      const menuEl = menuRefs.current[openMenuIndex];
      const btnEl = buttonRefs.current[openMenuIndex];
      const path = typeof e.composedPath === 'function' ? e.composedPath() : [];
      const pathHas = (node) => node ? path.includes(node) : false;
      const inMenu = path.length ? pathHas(menuEl) : !!(menuEl && menuEl.contains(e.target));
      const inBtn = path.length ? pathHas(btnEl) : !!(btnEl && btnEl.contains(e.target));
      if (!inMenu && !inBtn) setOpenMenuIndex(null);
    };

    document.addEventListener("pointerdown", handlePointerDown, { capture: true, signal });

    const onWindowBlur = () => setOpenMenuIndex(null);
    window.addEventListener('blur', onWindowBlur, { signal });

    const onKeyDown = (e) => { if (e.key === 'Escape') setOpenMenuIndex(null); };
    document.addEventListener('keydown', onKeyDown, { signal });

    const onFocusIn = (e) => {
      if (!closeGuardRef.current) return;
      const menuEl = menuRefs.current[openMenuIndex];
      const btnEl = buttonRefs.current[openMenuIndex];
      const t = e.target;
      const outside = !(menuEl && menuEl.contains(t)) && !(btnEl && btnEl.contains(t));
      if (outside) setOpenMenuIndex(null);
    };
    document.addEventListener('focusin', onFocusIn, { signal });

    window.addEventListener('scroll', onWindowBlur, { signal, passive: true });
    window.addEventListener('resize', onWindowBlur, { signal, passive: true });

    return () => {
      clearTimeout(enableGuard);
      ac.abort();
    };
  }, [openMenuIndex]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isMember) {
      setShowAuthModal(true);
      return;
    }
    if (!comment.text.trim()) return;
    
    const now = new Date();
    const kstNow = new Date(now.getTime() + 9*60*60*1000); // KST 기준
    const optimistic = {
      id: `temp-${Date.now()}`,
      text: comment.text,
      author: currentNickname || "ME",
      authorId: currentUserId,
      createdAt: kstNow,
      displayedAt: kstNow
    };
    setComments(prev => [optimistic, ...prev]);

    try {
      const payload = { loginId: currentUserId, content: optimistic.text };
      const { data } = await api.post(`/comments/post/${POST_ID}`, payload);
      setComments(prev => {
        const idx = prev.findIndex(c => c.id === optimistic.id);
        if (idx === -1) return prev;
        const serverItem = {
          id: data.id,
          text: data.content,
          author: data.nickname,
          authorId: data.loginId,
          createdAt: data.uploadDate ? new Date(data.uploadDate) : new Date(),
          displayedAt: data.displayedAt ? new Date(data.displayedAt)
                      : (data.modifyDate ? new Date(data.modifyDate)
                      : (data.uploadDate ? new Date(data.uploadDate) : new Date()))
        };
        const next = [...prev];
        next[idx] = serverItem;
        return next.sort((a,b)=>(b.displayedAt??0)-(a.displayedAt??0));
      });
      setComment(prev => ({ text: "", author: prev.author }));
    }
    catch (error) {
      setComments(prev => prev.filter(c => c.id !== optimistic.id));
      console.error("POST /comments/post Failed", error);
      alert(error.response?.data?.message || "등록 실패");
    }
  };

  const handleEditStart = (idx, text) => {
    const c = comments[idx];
    if (!c || c.authorId !== currentUserId) {
      setOpenMenuIndex(null);
      return;
    }
    setEditingCommentIndex(idx);
    setEditingText(text);
    setOpenMenuIndex(null);
  };

  const handleEditChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleEditSubmit = async (idx) => {
    const c = comments[idx];
    if (!c || c.authorId !== currentUserId) return;
    if (!editingText.trim()) return;

    const now = new Date();
    const kstNow = new Date(now.getTime() + 9*60*60*1000);
    const original = { ...c };
    const updatedLocal = { ...c, text: editingText, displayedAt: kstNow };
    setComments(prev => {
      const next = [...prev];
      next[idx] = updatedLocal;
      return next;
    });

    try {
      const payload = { loginId: currentUserId, content: editingText };
      const { data } = await api.put(`/comments/edit/${c.id}`, payload);
      setComments(prev => {
        const next = [...prev];
        next[idx] = {
          id: data.id,
          text: data.content,
          author: data.nickname,
          authorId: data.loginId,
          createdAt: data.uploadDate ? new Date(data.uploadDate) : original.createdAt,
          displayedAt: data.displayedAt ? new Date(data.displayedAt)
                     : (data.modifyDate ? new Date(data.modifyDate)
                     : (data.uploadDate ? new Date(data.uploadDate) : updatedLocal.displayedAt))
        };
        return next.sort((a,b)=>(b.displayedAt??0)-(a.displayedAt??0));
      });
      setEditingCommentIndex(null);
      setEditingText("");
    }
    catch (error) {
      setComments(prev => {
        const next = [...prev];
        next[idx] = original;
        return next;
      });
      console.error("PUT /comments/edit failed", error);
      alert(error.response?.data?.message || "수정 실패");
    }
  };

  const handleCancelEdit = () => {
    setEditingCommentIndex(null);
    setEditingText("");
  };

  const goLogin = () => {
    navigate("/login");
  };

  return (
    <>
      <CommentStyle />
      <div className="comments-app">
        {/* 입력폼 */}
        <div className="comment-form">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="textarea-wrapper">
            <div className="nickname-text">{currentNickname || "닉네임"}</div>
            <div className="char-counter">{comment.text.length}/300</div>
            <textarea
              className="input textarea-comment"
              name="text"
              value={comment.text}
              onChange={handleChange}
              placeholder="댓글을 남겨보세요"
              maxLength={300}
              required
            />
            <input type="submit" value="등록" className="btn btn-submit"/>
          </div>
        </form>
      </div>

      {/* 댓글 리스트 */}
      <div className="comments">
        {comments.map((c, idx) => {
          const isOwner = c.authorId === currentUserId;
          
          return (
            <div key={c.id ?? idx} className="comment">
              <div className="comment-box">
                {editingCommentIndex === idx ? (
                  <>
                    <div className="textarea-edit-wrapper">
                      <div className="char-counter">{editingText.length}/300</div>
                      <textarea
                        className="input textarea-edit"
                        value={editingText}
                        onChange={handleEditChange}
                        maxLength={300}
                        required
                      />
                    </div>
                    <div className="edit-actions">
                      <button className="btn btn-cancel" onClick={handleCancelEdit}>취소</button>
                      <button className="btn btn-save" onClick={() => handleEditSubmit(idx)}>저장</button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="comment-text">{c.text}</div>
                    
                    <div className="comment-footer">
                      <div className="comment-info">
                        <span className="comment-author"><a href={`mailto:${c.author}`}>{c.author}</a></span>
                        <span className="comment-date">
                          {c.displayedAt instanceof Date
                            ? new Date(c.displayedAt.getTime() + 9*60*60*1000)
                              .toISOString().slice(0,16).replace('T',' ')
                              : c.displayedAt}
                        </span>
                        <button
                          type="button"
                          className="btn btn-date-more"
                          onClick={() => setOriginalOpenIndex(prev => prev === idx ? null : idx)}
                          aria-label="show original created date"
                        >▽</button>
                        {originalOpenIndex === idx && (
                          <div className="date-dropdown">
                            최초 등록일: {c.createdAt instanceof Date 
                                            ? new Date(c.createdAt.getTime() + 9*60*60*1000).toISOString().slice(0,16).replace('T',' ')
                                            : c.createdAt}
                          </div>
                        )}
                      </div>

                      {isOwner && (
                        <div
                          className="comment-actions"
                          ref={(el) => { menuRefs.current[idx] = el; }}
                          onMouseLeave={() => {
                            if (openMenuIndex === idx) {
                              setTimeout(() => {
                                setOpenMenuIndex(prev => (prev === idx ? null : prev));
                              }, 150);
                            }
                          }}
                        >
                          <button
                            className="btn btn-more"
                            ref={(el) => { buttonRefs.current[idx] = el; }}
                            onClick={() => {
                              const nextOpen = openMenuIndex === idx ? null : idx;
                              setTimeout(() => { setOpenMenuIndex(nextOpen); }, 0);
                            }}
                          >···</button>

                          {openMenuIndex === idx && (
                            <div className="dropdown-menu">
                              <button
                                className="dropdown-item"
                                onClick={() => handleEditStart(idx, c.text)}
                              >수정</button>
                              <button
                                className="dropdown-item"
                                onClick={() => {
                                  if (!isOwner) return;
                                  setDeleteConfirmIdx(idx);
                                  setOpenMenuIndex(null);
                                }}
                              >삭제</button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })}        
      </div>

      {/* 백드롭 */}
      {openMenuIndex !== null && (
        <div className="dropdown-backdrop" onClick={() => setOpenMenuIndex(null)} />
      )}

      {/* 삭제 확인 모달 */}
      {deleteConfirmIdx !== null && (
        <div className="delete-confirm-modal">
          <div className="delete-confirm-content">
            <p className="delete-message">삭제하시겠습니까?</p>
            <div className="delete-actions">
              <button className="btn btn-cancel" onClick={() => setDeleteConfirmIdx(null)}>취소</button>
              <button
                className="btn btn-delete"
                onClick={async () => {
                  const idx = deleteConfirmIdx;
                  const target = comments[idx];
                  if (!target || target.authorId !== currentUserId) {
                    setDeleteConfirmIdx(null);
                    return;
                  }
                  
                  const removed = target;
                  setComments(prev => prev.filter((_, i) => i !== idx));
                  setDeleteConfirmIdx(null);
                  const idToDelete = removed.id;
                  if (typeof removed.id === 'string' && removed.id.startsWith('temp-')) return;

                  try {
                    await api.delete(`/comments/delete/${removed.id}`);
                  } catch (error) {
                    setComments(prev => {
                      const next = [...prev];
                      next.splice(idx, 0, removed);
                      return next;
                    });
                    console.error("DELETE /comments/delete failed", error);
                    alert(error.response?.data?.message || "삭제 실패");
                  }
                }}
              >확인</button>
            </div>
          </div>
        </div>
      )}

      {/* 회원 전용 안내 모달 */}
      {showAuthModal && (
        <div className="auth-modal">
          <div className="auth-modal-content">
            <p className="auth-message">회원만 댓글 작성이 가능합니다</p>
            <div className="auth-actions">
              <button className="btn btn-cancel" onClick={() => setShowAuthModal(false)}>취소</button>
              <button className="btn btn-save" onClick={() => navigate("/login")}>로그인</button>
            </div>
           </div>
         </div>
       )}
     </div>
   </>
  );
}

export default CommentsApp;