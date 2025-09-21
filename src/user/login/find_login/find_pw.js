import React, { useState, useEffect } from "react";
import axios from "axios";

export default function FindPwModal({ show, onClose, initialId = "" }) {
  const [pwId, setPwId] = useState(initialId);
  const [pwEmail, setPwEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [sendCodeClicked, setSendCodeClicked] = useState(false);
  const [timer, setTimer] = useState(0);
  const [modalMode, setModalMode] = useState("find"); // "find" or "reset"
  const [modalMessage, setModalMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false); // 작은 모달 표시 여부

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // ID가 넘어왔을 때 자동 세팅
  useEffect(() => {
    if (initialId) setPwId(initialId);
  }, [initialId]);

  // 타이머 관리
  useEffect(() => {
    let interval = null;
    if (sendCodeClicked && timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    } else if (timer === 0) {
      setSendCodeClicked(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sendCodeClicked, timer]);

  // 모달 상태 초기화
  const resetModal = () => {
    setModalMode("find");
    setPwId("");
    setPwEmail("");
    setVerificationCode("");
    setSendCodeClicked(false);
    setTimer(0);
    setNewPassword("");
    setConfirmPassword("");
    setModalMessage("");
    setShowMessage(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleMessageClose = () => {
    setShowMessage(false);

    if (modalMessage === "이메일 인증이 완료되었습니다.") {
      setModalMode("reset");
    } else if (modalMessage === "비밀번호가 성공적으로 변경되었습니다.") {
      handleClose();
    }
  };

  // 인증번호 전송
  const handleSendCode = async () => {
    if (!pwId || !pwEmail) return;
    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/findpw/send-auth",
        null,
        { params: { loginid: pwId, email: pwEmail } }
      );

      setModalMessage(
        typeof response.data === "string"
          ? response.data
          : response.data?.message || JSON.stringify(response.data)
      );
      setShowMessage(true);

      setSendCodeClicked(true);
      setTimer(5 * 60); // 5분 타이머
    } catch (err) {
      console.error(err);
      const data = err.response?.data;
      const errorMessage =
        typeof data === "string"
          ? data
          : data?.message || JSON.stringify(data) || "인증번호 확인 실패";

      setModalMessage(errorMessage);
      setShowMessage(true); // 작은 모달로 표시
    }
  };

  // 인증번호 확인
  const handleVerifyCode = async () => {
    if (!pwId || !pwEmail || !verificationCode) return;

    try {
      await axios.post("http://localhost:8080/api/user/findpw/verify-code", {
        loginid: pwId,
        email: pwEmail,
        code: verificationCode,
      });

      setModalMessage("이메일 인증이 완료되었습니다.");
      setShowMessage(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data &&
        (typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data));
      setModalMessage(errorMessage || "인증번호 확인 실패.");
      setShowMessage(true);
    }
  };

  // 비밀번호 재설정
  const handleResetPw = async () => {
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      setModalMessage("Passwords do not match.");
      setShowMessage(true);
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:8080/api/user/findpw/reset-password",
        {
          loginid: pwId,
          email: pwEmail,
          newPassword: newPassword,
        },
        { headers: { "Content-Type": "application/json" } }
      );

      setModalMessage(
        typeof response.data === "string"
          ? response.data
          : response.data?.message || JSON.stringify(response.data)
      );
      setShowMessage(true);
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data &&
        (typeof err.response.data === "string"
          ? err.response.data
          : JSON.stringify(err.response.data));
      setModalMessage(errorMessage || "비밀번호 재설정 실패.");
      setShowMessage(true);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Find Your PW 모달 */}
      <div className="modal">
        <div className="modal-content">
          {modalMode === "find" && (
            <>
              <h3>Find Your PW</h3>
              <input
                type="text"
                placeholder="Enter your ID"
                value={pwId}
                onChange={(e) => setPwId(e.target.value)}
              />
              <input
                type="email"
                placeholder="Enter your email"
                value={pwEmail}
                onChange={(e) => setPwEmail(e.target.value)}
              />
              <div className="verification-container">
                <input
                  type="text"
                  placeholder="Enter verification code"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                />
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={sendCodeClicked}
                >
                  {sendCodeClicked
                    ? `${Math.floor(timer / 60)}:${String(timer % 60).padStart(
                        2,
                        "0"
                      )}`
                    : "Send"}
                </button>
              </div>
              <button onClick={handleVerifyCode}>Verify Code</button>
              <button onClick={handleClose}>Close</button>
            </>
          )}

          {modalMode === "reset" && (
            <>
              <h3>Reset Password</h3>
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
              <button onClick={handleResetPw}>Reset PW</button>
              <button onClick={handleClose}>Close</button>
            </>
          )}
        </div>
      </div>

      {/* 작은 모달: Find Your PW 모달 위에 겹침 */}
      {showMessage && (
        <div className="modal small">
          <div className="modal-content">
            <p>{modalMessage}</p>
            <button onClick={handleMessageClose}>확인</button>
          </div>
        </div>
      )}
    </>
  );
}
