import React from "react";

function Popup({ 
  showPopup, 
  setShowPopup, 
  popupMessage, 
  popupInput, 
  setPopupInput, 
  popupType, 
  confirmRename, 
  confirmDelete, 
  confirmLogout, 
  confirmEmail,
  setRenamingChatId,
  setDeletingChatId,
  popupRef
}) {
  const handleClose = () => {
    setShowPopup(false);
    setPopupInput("");
    setRenamingChatId(null);
    setDeletingChatId(null);
  };

  const handleConfirm = () => {
    if (popupType === "rename") {
      confirmRename();
    } else if (popupType === "delete") {
      confirmDelete();
    } else if (popupType === "logout") {
      confirmLogout();
    } else if (popupType === "email") {
      confirmEmail();
    }
  };

  if (!showPopup) return null;

  return (
    <div className="popup-overlay" onClick={handleClose}>
      <div id="custom-popup" ref={popupRef} className="custom-popup" onClick={(e) => e.stopPropagation()}>
        <p className="popup-message">{popupMessage}</p>
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
          <button className="popup-button cancel" onClick={handleClose}>
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
  );
}

export default Popup;
