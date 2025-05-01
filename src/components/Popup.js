import React from 'react';

const Popup = ({ 
  showPopup, 
  popupMessage, 
  popupType, 
  popupInput, 
  setPopupInput, 
  handleCancel, 
  handleConfirm, 
  popupRef 
}) => {
  if (!showPopup) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-50">
      <div 
        ref={popupRef}
        className="bg-card border border-border rounded-lg shadow-lg w-full max-w-md p-6 animate-in fade-in duration-300"
      >
        <h3 className="text-lg font-medium mb-4">{popupMessage}</h3>
        
        {popupType === "rename" && (
          <input
            type="text"
            value={popupInput}
            onChange={(e) => setPopupInput(e.target.value)}
            placeholder="Nome do chat"
            className="w-full p-2 mb-4 border border-border rounded-md bg-secondary/50 focus:outline-none focus:ring-2 focus:ring-accent/50"
          />
        )}
        
        <div className="flex justify-end gap-3">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-md border border-border hover:bg-secondary/80 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </div>
    </div>
  );
};

export default Popup;
