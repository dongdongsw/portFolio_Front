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

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setComment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.text || !comment.author) return;

    const newComment = {
      ...comment,
      
      date: new Date(),
    };

    setComments((prev) => [newComment, ...prev]);
    setComment({ text: "", author: "" });
  };

  return (
    <>
    <CommentStyle />
    <div className="comments-app">
      <h1>Comments App - React</h1>

      {/* 입력폼 */}
      <div className="comment-form">
        
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <textarea
              className="input"
              name="text"
              value={comment.text}
              onChange={handleChange}
              placeholder="Add comment..."
              required
            />
          </div>
          <div className="form-row">
            <input
              className="input"
              name="author"
              value={comment.author}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              required
            />
          </div>
          
          <div className="form-row">
            <input type="submit" value="등록" />
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
                  <span className="comment-author">
                    
                      <a href={`mailto:${c.author}`}>{c.author}</a>
                    
                  </span>
                  <span className="comment-date">
                    {c.date instanceof Date
                      ? c.date.toLocaleString()
                      : new Date(c.date).toLocaleString()}
                  </span>
                </div>
                <div className="comment-actions">
                  <a href="#">Reply</a>
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
