import React, { useState } from "react";
import "./comment.css"; // 기존 CSS 그대로 불러오기
import { createGlobalStyle } from 'styled-components';


  const CommentStyle = createGlobalStyle`
  * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;

  -webkit-box-sizing: border-box;
 	-moz-box-sizing: border-box;
}

body{
  background-color: #dee1e3;
  font-family: "Roboto", "Tahoma", "Arial", sans-serif;
}
    `;


  function CommentsApp() {
  const [comment, setComment] = useState({
    text: "",
    author: "",
    
  });
  const [comments, setComments] = useState([
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit...",
      author: "Sexar",
      
      
      date: new Date("2013-02-02T23:32:04"),
    },
    {
      text: "Eligendi voluptatum ducimus architecto tempore...",
      author: "Ximme",
      
      
      date: new Date("1986-01-31T23:32:04"),
    },
  ]);

  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setComment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.text) return;

    if (isEditing && selectedIndex !== null) {
      setComments((prev) => {
        const next = [...prev];
        next[selectedIndex] = {
          ...next[selectedIndex],
          text: comment.text,
          author: comment.author,
          date: new Date(),
        };
        return next;
      });
      setIsEditing(false);
      setSelectedIndex(null);
    } else  {

    const newComment = {
      ...comment,
      
      date: new Date(),
    };

    setComments((prev) => [newComment, ...prev]);
    }
    setComment((prev) => ({ text: "", author: prev.author }));
  };

  const handleSelect = (index) => {
    setSelectedIndex(index);
  };

  const handleEdit = () => {
    if (selectedIndex === null) return;
    const target = comments[selectedIndex];
    setComment({ text: target.text, author: target.author });

    setIsEditing(true);
  };

  const handleDelete = () => {
    if (selectedIndex === null) return;
    setComments((prev) => prev.filter((_, i) => i !== selectedIndex));
    setSelectedIndex(null);
    setIsEditing(false);
    setComment((prev) => ({ text: "", author: prev.author }));
  };

  return (
    <>
    <CommentStyle />
    <div className="comments-app">
      

      {/* 입력폼 */}
      <div className="comment-form">
        
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <textarea
              className="input"
              name="text"
              value={comment.text}
              onChange={handleChange}
              placeholder="댓글을 남겨보세요"
              required
            />
          </div>
          <div className="form-row">
            <input
              className="input read-only"
              name="author"
              value={comment.author}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              readOnly
            />
          </div>
          
          <div className="form-row form-actions">
            <button type="button" onClick={handleDelete} className="btn btn-delete">삭제</button>
            <button type="button" onClick={handleEdit} className="btn btn-edit">
              {isEditing ? "수정중" : "수정"}
            </button>
            <input type="submit" value={isEditing ? "저장" : "등록"}
            className="btn btn-submit"
            />
          </div>
        </form>
      </div>

      {/* 댓글 리스트 */}
      <div className="comments">
        {comments.map((c, idx) => (
          <div key={idx}
          className={`comment ${selectedIndex === idx ? "selected" : ""}`}
          onClick={() => handleSelect(idx)}

          > 
            <div className="comment-box">
              <div className="comment-text">{c.text}</div>
              <div className="comment-footer">
                <div className="comment-info">
                  <span className="comment-author">
                    
                      <a href={`mailto:${c.author}`}>{c.author}</a>
                    
                  </span>
                  <span className="comment-date">
                    {c.date instanceof Date
                      ? c.date.toLocaleString()
                      : new Date(c.date).toLocaleString()}
                  </span>
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
