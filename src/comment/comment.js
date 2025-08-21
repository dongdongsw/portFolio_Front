import React, { useState } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setComment((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.text) return;
    if (isEditing && selectedIndex !== null) {
      setComments((prev) => {
        const next = [...prev];
        next[selectedIndex] = { ...next[selectedIndex], text: comment.text, author: comment.author, date: new Date() };
        return next;
      });
      setIsEditing(false);
      setSelectedIndex(null);
    } else  {
      setComments (prev => [{ ...comment, date: new Date() }, ...prev]);
    }
    setComment(prev => ({ text: "", author: prev.author }));
  };

  return (
    <>
      <CommentStyle />
      <div className="comments-app">
        {/* 입력폼 */}
        <div className="comment-form">
          <form className="form" onSubmit={handleSubmit} noValidate>
            <div className="textarea-wrapper">
            <div className="email-text">Email</div>
            <textarea
              className="input textarea-comment"
              name="text"
              value={comment.text}
              onChange={handleChange}
              placeholder="댓글을 남겨보세요"
              required
            />
            <input type="submit" value={isEditing ? "저장" : "등록"} className="btn btn-submit"/>
          </div>
        </form>
      </div>

      {/* 댓글 리스트 */}
      <div className="comments">
        {comments.map((c, idx) => (
          <div key={idx} className="comment">
             <div className="comment-box">
               <div className="comment-text">{c.text}</div>
               <div className="comment-footer">
                 <div className="comment-info">
                   <span className="comment-author"><a href={`mailto:${c.author}`}>{c.author}</a></span>
                   <span className="comment-date">{c.date instanceof Date ? c.date.toLocaleString() : new Date(c.date).toLocaleString()}</span>
                 </div>
                 <div className="comment-actions">
                   <button className="btn btn-more" onClick={() => setOpenMenuIndex(openMenuIndex === idx ? null : idx)}>···</button>
                   {openMenuIndex === idx && (
                     <div className="dropdown-menu">
                       <button className="dropdown-item" onClick={() => { setComment({ text: c.text, author: c.author }); setIsEditing(true); setSelectedIndex(idx); setOpenMenuIndex(null); }}>수정</button>
                       <button className="dropdown-item" onClick={() => { setComments((prev) => prev.filter((_, i) => i !== idx)); setOpenMenuIndex(null); }}>삭제</button>
                     </div>
                   )}
                 </div> 
               </div>
             </div>
           </div>
         ))}        
       </div>
     </div>
   </>
 );
}

export default CommentsApp;
