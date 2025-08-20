import React, { useState, useEffect } from 'react';

export default function FindPwModal({ show, onClose, initialId="" }) {
  const [pwId, setPwId] = useState(initialId);
  const [pwEmail, setPwEmail] = useState("");   
  const [verificationCode, setVerificationCode] = useState("");
  const [sendCodeClicked, setSendCodeClicked] = useState(false);
  const [timer, setTimer] = useState(0);

  // 메시지 모달 상태
  const [modalMessage, setModalMessage] = useState(""); 
  const [showMessage, setShowMessage] = useState(false);
  const [messageAutoHide, setMessageAutoHide] = useState(true); // 자동 사라짐 여부

  const [generatedCode, setGeneratedCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [modalMode, setModalMode] = useState("find");

  // 🔹 initialId가 바뀔 때마다 pwId에 반영
  useEffect(() => { 
    if (initialId) {
      setPwId(initialId); 
    }
  }, [initialId]);

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

  // 메시지 자동 닫힘 처리
  useEffect(() => {
    let timeout;
    if (showMessage && messageAutoHide) {
      timeout = setTimeout(() => setShowMessage(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showMessage, messageAutoHide]);

  const showModalMessage = (message, autoHide = true) => {
    setModalMessage(message);
    setMessageAutoHide(autoHide);
    setShowMessage(true);
  };

  const handleSendCode = () => {
    if (!pwId || !pwEmail) {
      showModalMessage("Please enter both ID and email.");
      return;
    }
    const testUsers = [
      { id: "qwer", email: "test@example.com" },
      { id: "asdf", email: "asdf@example.com" }
    ];
    const userMatch = testUsers.find(user => user.id === pwId && user.email === pwEmail);
    if (!userMatch) {
      showModalMessage("The entered ID and email do not match.");
      return;
    }
    const tempCode = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(tempCode);
    console.log("Generated verification code (for testing):", tempCode);
    showModalMessage("Verification code has been sent. (Check console for test code)");
    setSendCodeClicked(true);
    setTimer(5 * 60);
  };

  const handleFindPw = () => {
    if (!pwId || !pwEmail || !verificationCode) {
      showModalMessage("Please enter ID, email, and verification code.");
      return;
    }
    if (verificationCode !== generatedCode) {
      showModalMessage("The verification code is incorrect.");
      return;
    }
    setModalMode("reset");
  };

  const handleResetPw = () => {
    if (!newPassword || !confirmPassword) {
      showModalMessage("Please fill in both password fields.");
      return;
    }
    if (newPassword !== confirmPassword) {
      showModalMessage("Passwords do not match.");
      return;
    }

    // 여기서만 autoHide false -> 사용자가 닫을 때까지 유지
    showModalMessage("Password has been successfully changed!", false);
  };

  const handleMessageClose = () => {
    setShowMessage(false);
    if (!messageAutoHide) {
      // Reset PW 성공 메시지 후 초기화 + 모든 모달 닫기
      setNewPassword("");
      setConfirmPassword("");
      setPwId("");
      setPwEmail("");
      setVerificationCode("");
      setGeneratedCode("");
      setSendCodeClicked(false);
      setTimer(0);
      setModalMode("find");
      onClose();  // 🔹 여기서 모든 모달 닫히고 로그인 화면으로
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content" style={{ minHeight:'480px', display:'flex', flexDirection:'column', justifyContent:'flex-start', padding:'20px', gap:'10px' }}>
        {modalMode === "find" && (
          <>
            <h3>Find Your PW</h3>
            <input type="text" placeholder="Enter your ID" value={pwId} onChange={(e)=>setPwId(e.target.value)} style={{ height:'40px', fontSize:'14px' }} />
            <input type="email" placeholder="Enter your email" value={pwEmail} onChange={(e)=>setPwEmail(e.target.value)} style={{ height:'40px', fontSize:'14px' }} />
            <div className="verification-container">
              <input type="text" placeholder="Enter verification code" value={verificationCode} onChange={(e)=>setVerificationCode(e.target.value)} style={{ height:'40px', fontSize:'14px', flex:2 }} />
              <button type="button" onClick={handleSendCode} disabled={sendCodeClicked} style={{ flex:1, height:'40px', fontSize:'12px' }}>
                {sendCodeClicked ? `${Math.floor(timer/60)}:${String(timer%60).padStart(2,'0')}` : "Send Code"}
              </button>
            </div>
            <div className="modal-buttons" style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'auto' }}>
              <button type="button" className="form__button button" onClick={handleFindPw}>Find PW</button>
              <button type="button" className="form__button button" onClick={() => onClose()}>Close</button>
            </div>
          </>
        )}

        {modalMode === "reset" && (
          <>
            <h3>Reset Your Password</h3>
            <input type="password" placeholder="New Password" value={newPassword} onChange={(e)=>setNewPassword(e.target.value)} style={{ height:'40px', fontSize:'14px' }} />
            <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e)=>setConfirmPassword(e.target.value)} style={{ height:'40px', fontSize:'14px' }} />
            <div className="modal-buttons" style={{ display:'flex', flexDirection:'column', gap:'10px', marginTop:'auto' }}>
              <button type="button" className="form__button button" onClick={handleResetPw}>Reset PW</button>
              <button type="button" className="form__button button" onClick={handleMessageClose}>Close</button>
            </div>
          </>
        )}

        {showMessage && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            backgroundColor: '#e4e1da', padding: '20px 30px', borderRadius: '10px',
            boxShadow: '0 4px 10px rgba(0,0,0,0.2)', zIndex: 500, minWidth: '250px', textAlign: 'center'
          }}>
            <p style={{ marginBottom:'15px', color:'#6f6767' }}>{modalMessage}</p>
            <button style={{ width:'100px', height:'40px', borderRadius:'8px', cursor:'pointer', backgroundColor:'#c7c8cc', color:'#fff', border:'none' }} onClick={handleMessageClose}>
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
