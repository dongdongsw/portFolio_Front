import React, { useState } from "react";
import axios from "axios";

export default function FindIdModal({ show, onClose, onOpenPwModal }) {
  const [idEmail, setIdEmail] = useState("");
  const [foundId, setFoundId] = useState("");
  const [showSmallModal, setShowSmallModal] = useState(false);
  const [idInputError, setIdInputError] = useState(false);

  const handleFindId = async () => {
    if (!idEmail.trim()) {
      setIdInputError(true);
      return;
    }
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/findid/verify-id",
        { email: idEmail },
        { withCredentials: true }
      );

      if (response.data && response.data.loginid) {
        setFoundId(response.data.loginid);
        setShowSmallModal(true);
      } else {
        alert("아이디를 찾을 수 없습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Find Your ID 모달 */}
      <div className="modal">
        <div className="modal-content">
          <h3>Find ID</h3>
          <p>Enter your email to find your ID</p>

          <input
            type="email"
            placeholder="Enter your email"
            value={idEmail}
            className={idInputError ? "error" : ""}
            onChange={(e) => {
              setIdEmail(e.target.value);
              if (idInputError) setIdInputError(false);
            }}
          />

          {idInputError && (
            <p className="modal-error-message">Please enter your email</p>
          )}

          <button className="find-id-btn" onClick={handleFindId}>
            Find ID
          </button>

          <button
            onClick={() => {
              setIdEmail("");
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </div>

      {/* 작은 모달: 기존 모달 위에 겹침 */}
      {showSmallModal && (
        <div className="modal small">
          <div className="modal-content">
            <p>
              ID : <strong>{foundId}</strong>
            </p>
            <button
              onClick={() => {
                setShowSmallModal(false);
                setIdEmail("");
                onClose();
                // 항상 초기화된 상태로 PW 모달 열기
                onOpenPwModal(foundId);
              }}
            >
              확인
            </button>
          </div>
        </div>
      )}
    </>
  );
}
