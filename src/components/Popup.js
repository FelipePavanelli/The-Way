import React from 'react';

function Popup({ 
  showPopup, 
  popupMessage, 
  popupType, 
  popupInput, 
  setPopupInput, 
  handleCancel, 
  handleConfirm, 
  popupRef 
}) {
  return (
    <>
      {showPopup && (
        <div className="popup-overlay" onClick={handleCancel}>
          <div id="custom-popup" ref={popupRef} className="custom-popup" onClick={(e) => e.stopPropagation()}>
            <p>{popupMessage}</p>
            {popupType === "rename" && (
              <input
                type="text"
                value={popupInput}
                onChange={(e) => setPopupInput(e.target.value)}
                placeholder="Digite o nome do chat"
                className="popup-input"
                autoFocus
              />
            )}
            <div className="popup-actions">
              <button className="popup-button" onClick={handleCancel}>
                Cancelar
              </button>
              <button
                className="popup-button confirm"
                onClick={handleConfirm}
                disabled={popupType === "rename" && (!popupInput || !popupInput.trim())}
              >
                {popupType === "email" ? "Show me The Way" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Popup;