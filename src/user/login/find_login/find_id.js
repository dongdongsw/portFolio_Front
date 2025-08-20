import React, { useState } from 'react';

export default function FindIdModal({ show, onClose, onOpenPwModal }) {
  const [idEmail, setIdEmail] = useState("");
  const [foundId, setFoundId] = useState("");
  const [idNotFound, setIdNotFound] = useState(false);
  const [idInputError, setIdInputError] = useState(false);

  const handleFindId = () => {
    if (!idEmail.trim()) {
      setIdInputError(true);
    } else if (idEmail === "test@example.com") {
      setFoundId("qwer");
      setIdNotFound(false);
    } else {
      setIdNotFound(true);
    }
  };

  if (!show) return null;

  return (
    <div className="modal">
      <div className="modal-content">
        {foundId === "" && !idNotFound && (
          <>
            <h3>Find Your ID</h3>
            <p className="modal-description">Enter your email to find your ID</p>
            <input
              type="email"
              placeholder="Enter your email"
              value={idEmail}
              className={idInputError ? 'error' : ''}
              onChange={(e) => { setIdEmail(e.target.value); if(idInputError) setIdInputError(false); }}
            />
            {idInputError && <p className="modal-error-message">Please enter your email</p>}
            <div className='modal-buttons'>
              <button type="button" onClick={handleFindId}>Find ID</button>
              <button type="button" onClick={() => {
                setFoundId("");
                setIdEmail("");
                setIdNotFound(false);
                setIdInputError(false);
                onClose();
              }}>Close</button>
            </div>
          </>
        )}

        {foundId !== "" && (
          <>
            <h3>Your ID</h3>
            <p className="modal-description">{foundId}</p>
            <div className='modal-buttons'>
              <button type="button" onClick={() => {
                onOpenPwModal(foundId); // 🔹 전달
                setFoundId("");
                setIdEmail("");
              }}>Find PW</button>
              <button type="button" onClick={() => {
                setFoundId("");
                setIdEmail("");
                onClose();
              }}>Close</button>
            </div>
          </>
        )}

        {idNotFound && (
          <>
            <h3>Find Your ID</h3>
            <p className="modal-description lowered">No ID found for this email</p>
            <div className='modal-buttons'>
              <button type="button" onClick={() => setIdNotFound(false)}>Back</button>
              <button type="button" onClick={() => {
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
