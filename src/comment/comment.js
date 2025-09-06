import React, { useState, useRef, useEffect } from "react";
import "./comment.css";
import { createGlobalStyle } from 'styled-components';


const CommentStyle = createGlobalStyle`
  * { box-sizing: border-box; margin: 0; padding: 0; 
      -webkit-box-sizing: border-box;
 	    -moz-box-sizing: border-box;
    }

  body{ background-color: #dee1e3; font-family: "Roboto", "Tahoma", "Arial", sans-serif; }
`;

function CommentsApp() {
  const [openMenuIndex, setOpenMenuIndex] = useState(null);
  const [comment, setComment] = useState({ text: "", author: "", });
  const [comments, setComments] = useState([
    { text: "예시1", author: "CHEOLWOO", date: new Date("2013-02-02T23:32:04") },
    { text: "예시2", author: "Ximme", date: new Date("1986-01-31T23:32:04") }
  ]);
  const [editingCommentIndex, setEditingCommentIndex] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [deleteConfirmIdx, setDeleteConfirmIdx] = useState(null);
  
  const menuRefs = useRef({});
  const buttonRefs = useRef({});
  const closeGuardRef = useRef(false);

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

      if (!inMenu && !inBtn) {
        setOpenMenuIndex(null);
      }
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
    const { name, value, type, checked } = e.target;
    setComment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.text) return;
    setComments (prev => [{ ...comment, date: new Date() }, ...prev]);
    setComment(prev => ({ text: "", author: prev.author }));
  };

  const handleEditStart = (idx, text) => {
    setEditingCommentIndex(idx);
    setEditingText(text);
    setOpenMenuIndex(null);
  };

  const handleEditChange = (e) => {
    setEditingText(e.target.value);
  };

  const handleEditSubmit = (idx) => {
    if (!editingText.trim()) return;
    setComments((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], text: editingText, date: new Date() };
      return next;
    });
    setEditingCommentIndex(null);
    setEditingText("");
  };

  const handleCancelEdit = () => {
    setEditingCommentIndex(null);
    setEditingText("");
  };

  return (
    <>
      <CommentStyle />
      <div className="comments-app">
        {/* 입력폼 */}
        <div className="comment-form">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="textarea-wrapper">
            <div className="email-text">닉네임</div>
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
        {comments.map((c, idx) => (
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
                    <button 
                      className="btn btn-cancel"
                      onClick={handleCancelEdit}
                    >취소</button>
                    <button
                      className="btn btn-save"
                      onClick={() => handleEditSubmit(idx)}
                    >저장</button>
                  </div>
                </>
              ) : (
                <>
                  <div className="comment-text">{c.text}</div>
                  <div className="comment-footer">
                    <div className="comment-info">
                      <span className="comment-author"><a href={`mailto:${c.author}`}>{c.author}</a></span>
                      <span className="comment-date">
                        {c.date instanceof Date ? c.date.toLocaleString() : new Date(c.date).toLocaleString()}</span>
                    </div>

                    <div 
                      className="comment-actions"
                      ref={(el) => { menuRefs.current[idx] = el; }}
                      onMouseLeave={() => {
                        if (openMenuIndex === idx) {
                          const t = setTimeout(() => {
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
                              setDeleteConfirmIdx(idx);
                              setOpenMenuIndex(null);
                            }}
                          >삭제</button>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        ))}        
        </div>

        {openMenuIndex !== null && (
          <div
            className="dropdown-backdrop"
            onClick={() => setOpenMenuIndex(null)}
          />
        )}

        {deleteConfirmIdx !== null && (
          <div className="delete-confirm-modal">
            <div className="delete-confirm-content">
              <p className="delete-message">삭제하시겠습니까?</p>
              <div className="delete-actions">
                <button
                  className="btn btn-cancel"
                  onClick={() => setDeleteConfirmIdx(null)}
                >취소</button>
                <button
                  className="btn btn-delete"
                  onClick={() => {
                    setComments((prev) => prev.filter((_, i) => i !== deleteConfirmIdx));
                    setDeleteConfirmIdx(null);
                  }}
                >확인</button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
}

export default CommentsApp;