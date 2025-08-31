import React, { useState, useEffect } from 'react';
import axios from 'axios';

export default function FindPwModal({ show, onClose, initialId = "" }) {
  const [pwId, setPwId] = useState(initialId);
  const [pwEmail, setPwEmail] = useState("");   
  const [verificationCode, setVerificationCode] = useState("");
  const [sendCodeClicked, setSendCodeClicked] = useState(false);
  const [timer, setTimer] = useState(0);
  const [modalMode, setModalMode] = useState("find");
  const [modalMessage, setModalMessage] = useState(""); 
  const [showMessage, setShowMessage] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => { if (initialId) setPwId(initialId); }, [initialId]);

  useEffect(() => {
    let interval = null;
    if (sendCodeClicked && timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else if (timer === 0) {
      setSendCodeClicked(false);
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [sendCodeClicked, timer]);

  const showModalMessage = (message) => {
    setModalMessage(message);
    setShowMessage(true);
  };

  // 인증번호 이메일 발송
  const handleSendCode = async () => {
    if (!pwId || !pwEmail) { showModalMessage("Please enter both ID and email."); return; }
    try {
      await axios.post("http://localhost:8080/api/user/findpw/send-auth", null, {
        params: { loginid: pwId, email: pwEmail }
      });
      showModalMessage("Verification code has been sent to your email.");
      setSendCodeClicked(true);
      setTimer(5 * 60); // 5분 타이머
    } catch (err) {
      console.error(err);
      showModalMessage(err.response?.data || "Error sending verification code.");
    }
  };

  // 인증번호 검증 → 서버 세션 기반
  const handleFindPw = async () => {
    if (!pwId || !pwEmail || !verificationCode) { showModalMessage("Please fill all fields."); return; }
    try {
      await axios.post("http://localhost:8080/api/user/findpw/verify-pw", {
        loginid: pwId,
        code: verificationCode,
        newPassword: "dummy"  // 실제 변경은 reset 모드에서
      });
      setModalMode("reset");
    } catch (err) {
      console.error(err);
      showModalMessage(err.response?.data || "Verification failed.");
    }
  };

  // 비밀번호 재설정
  const handleResetPw = async () => {
    if (!newPassword || !confirmPassword) { showModalMessage("Please fill both password fields."); return; }
    if (newPassword !== confirmPassword) { showModalMessage("Passwords do not match."); return; }
    try {
      await axios.post("http://localhost:8080/api/user/findpw/verify-pw", {
        loginid: pwId,
        code: verificationCode,
        newPassword
      });
      showModalMessage("Password has been successfully changed!");
      setModalMode("find");
      setPwId(""); setPwEmail(""); setVerificationCode(""); setSendCodeClicked(false); setTimer(0);
      setNewPassword(""); setConfirmPassword("");
      onClose();
    } catch (err) {
      console.error(err);
      showModalMessage(err.response?.data || "Failed to reset password.");
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        {modalMode === "find" && (
          <>
            <h3>Find Your PW</h3>
            <input type="text" placeholder="Enter your ID" value={pwId} onChange={(e)=>setPwId(e.target.value)} />
            <input type="email" placeholder="Enter your email" value={pwEmail} onChange={(e)=>setPwEmail(e.target.value)} />
            <div className="verification-container">
              <input type="text" placeholder="Enter verification code" value={verificationCode} onChange={(e)=>setVerificationCode(e.target.value)} />
              <button type="button" onClick={handleSendCode} disabled={sendCodeClicked}>
                {sendCodeClicked ? `${Math.floor(timer/60)}:${String(timer%60).padStart(2,'0')}` : "Send Code"}
              </button>
            </div>
            <button onClick={handleFindPw}>Verify Code</button>
            <button onClick={onClose}>Close</button>
          </>
        )}
        {modalMode === "reset" && (
          <>
            <h3>Reset Your Password</h3>
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} />
            <button onClick={handleResetPw}>Reset PW</button>
            <button onClick={() => { setModalMode("find"); onClose(); }}>Close</button>
          </>
        )}
        {showMessage && (
          <div className="modal-message">
            <p>{modalMessage}</p>
            <button onClick={() => setShowMessage(false)}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}
