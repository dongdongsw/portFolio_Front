import React, { useState } from 'react';
import axios from 'axios';

export default function FindIdModal({ show, onClose, onOpenPwModal }) {
  const [idEmail, setIdEmail] = useState("");
  const [foundId, setFoundId] = useState("");
  const [idNotFound, setIdNotFound] = useState(false);
  const [idInputError, setIdInputError] = useState(false);

  // ID 찾기 요청
  const handleFindId = async () => {
    if (!idEmail.trim()) {
      setIdInputError(true);
      return;
    }

    try {
      // POST 요청으로 JSON 바디 전송
      const response = await axios.post("http://localhost:8080/api/user/findid/verify-id", {
        email: idEmail,
        withCredentials: true
      });

      if (response.data && response.data.loginid) {
        setFoundId(response.data.loginid);
        setIdNotFound(false);
      } else {
        setIdNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setIdNotFound(true);
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        {/* 초기 폼 */}
        {foundId === "" && !idNotFound && (
          <>
            <h3>Find Your ID</h3>
            <p>Enter your email to find your ID</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={idEmail}
              className={idInputError ? 'error' : ''}
              onChange={(e) => {
                setIdEmail(e.target.value);
                if (idInputError) setIdInputError(false);
              }}
            />
            {idInputError && <p className="modal-error-message">Please enter your email</p>}
            <div className="modal-buttons">
              <button onClick={handleFindId}>Find ID</button>
              <button onClick={() => {
                setIdEmail("");
                setFoundId("");
                setIdNotFound(false);
                setIdInputError(false);
                onClose();
              }}>Close</button>
            </div>
          </>
        )}

        {/* ID 찾기 성공 */}
        {foundId !== "" && (
          <>
            <h3>Your ID</h3>
            <p>{foundId}</p>
            <div className="modal-buttons">
              <button onClick={() => {
                onOpenPwModal(foundId);
                setFoundId("");
                setIdEmail("");
              }}>Find PW</button>
              <button onClick={() => {
                setFoundId("");
                setIdEmail("");
                onClose();
              }}>Close</button>
            </div>
          </>
        )}

        {/* ID 찾기 실패 */}
        {idNotFound && (
          <>
            <h3>Find Your ID</h3>
            <p>No ID found for this email</p>
            <div className="modal-buttons">
              <button onClick={() => setIdNotFound(false)}>Back</button>
              <button onClick={() => {
                setIdEmail("");
                setIdNotFound(false);
                onClose();
              }}>Close</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
