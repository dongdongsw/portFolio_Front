import React, { useState } from "react";
import "./comment.css"; // 기존 CSS 그대로 불러오기
import { createGlobalStyle } from 'styled-components';

function comment() {
  const GlobalStyle = createGlobalStyle`
  body {
     width: 100%;
    background-color: #e4e1da; 
    font-size: 14px; 
    height: 100vh; 
    -webkit-font-smoothing: antialiased; 
    -moz-osx-font-smoothing: grayscale; 
    font-family: 'proxima-nova-soft', sans-serif; 
    display: flex; 
    color: #6f6767; 
    align-items: center; 
    justify-content: center;
  }
    `;


  function CommentsApp() {
  const [comment, setComment] = useState({
    text: "",
    author: "",
    anonymous: false,
  });
  const [comments, setComments] = useState([
    {
      text: "Lorem ipsum dolor sit amet, consectetur adipisicing elit...",
      author: "Sexar",
      anonymous: false,
      avatarSrc:
        "http://gravatar.com/avatar/412c0b0ec99008245d902e6ed0b264ee?s=80",
      date: new Date("2013-02-02T23:32:04"),
    },
    {
      text: "Eligendi voluptatum ducimus architecto tempore...",
      author: "Ximme",
      anonymous: false,
      avatarSrc: "http://lorempixel.com/200/200/people",
      date: new Date("1986-01-31T23:32:04"),
    },
  ]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setComment((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
      ...(name === "anonymous" && checked ? { author: "" } : {}),
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!comment.text || (!comment.anonymous && !comment.author)) return;

    const newComment = {
      ...comment,
      avatarSrc: "http://lorempixel.com/200/200/people/",
      date: new Date(),
    };

    setComments((prev) => [newComment, ...prev]);
    setComment({ text: "", author: "", anonymous: false });
  };

  return (
    <>
    <GlobalStyle />
    <div className="comments-app">
      <h1>Comments App - React</h1>

      {/* 입력폼 */}
      <div className="comment-form">
        <div className="comment-avatar">
          <img src="http://lorempixel.com/200/200/people" alt="avatar" />
        </div>
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
              className={`input ${comment.anonymous ? "disabled" : ""}`}
              name="author"
              value={comment.author}
              onChange={handleChange}
              placeholder="Email"
              type="email"
              disabled={comment.anonymous}
              required={!comment.anonymous}
            />
          </div>
          <div className="form-row text-right">
            <input
              id="comment-anonymous"
              name="anonymous"
              type="checkbox"
              checked={comment.anonymous}
              onChange={handleChange}
            />
            <label htmlFor="comment-anonymous">Anonymous</label>
          </div>
          <div className="form-row">
            <input type="submit" value="Add Comment" />
          </div>
        </form>
      </div>

      {/* 댓글 리스트 */}
      <div className="comments">
        {comments.map((c, idx) => (
          <div key={idx} className="comment">
            <div className="comment-avatar">
              <img src={c.avatarSrc} alt="avatar" />
            </div>
            <div className="comment-box">
              <div className="comment-text">{c.text}</div>
              <div className="comment-footer">
                <div className="comment-info">
                  <span className="comment-author">
                    {c.anonymous ? (
                      <em>Anonymous</em>
                    ) : (
                      <a href={`mailto:${c.author}`}>{c.author}</a>
                    )}
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
}

export default CommentsApp;
