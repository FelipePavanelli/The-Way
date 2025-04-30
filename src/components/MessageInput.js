import React from 'react';
import { FaArrowUp, FaEnvelope, FaHandPaper } from 'react-icons/fa';

function MessageInput({ 
  inputValue, 
  setInputValue, 
  handleInput, 
  handleKeyDown, 
  handleSendMessage, 
  handleEmailButton, 
  isThinking, 
  textareaRef,
  isDarkMode 
}) {
  return (
    <>
      <div className="bottom-input-bg" />
      <div className="new-input-box" style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
        maxWidth: "800px",
        margin: "0 auto",
        padding: "10px 20px",
        borderRadius: "30px", 
        background: isDarkMode ? "#3a3a3a" : "#f5e8d6",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        <textarea
          ref={textareaRef}
          placeholder="Mensagem para o The Way"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          rows={1}
          style={{
            flex: 1,
            marginRight: "0.5rem",
            fontFamily: '"Inter", sans-serif',
            fontSize: "1rem",
            fontWeight: 400,
            padding: "12px 16px",
            minHeight: "48px",
            background: "transparent",
            borderRadius: "24px",
            border: "none",
            outline: "none",
            resize: "none"
          }}
        />
        <div className="input-actions" style={{ display: "flex", gap: "0.8rem" }}>
          <button
            onClick={handleEmailButton}
            disabled={isThinking}
            style={{
              cursor: isThinking ? "not-allowed" : "pointer",
              background: "transparent",
              border: "none",
              color: isDarkMode ? "#ddd" : "#333",
              fontSize: "1.2rem",
              padding: "8px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <FaEnvelope />
          </button>
          {isThinking ? (
            <div
              style={{
                background: isDarkMode ? "#2e2e3e" : "#e8d7bc",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: isDarkMode ? "#cecccc" : "#333",
                fontSize: "1.2rem",
                cursor: "default"
              }}
              aria-label="Aguardando processamento (não clicável)"
            >
              <FaHandPaper />
            </div>
          ) : (
            <button
              className="send-button"
              onClick={() => handleSendMessage()}
              style={{
                fontSize: "1.2rem",
                cursor: "pointer",
                color: "#fff",
                background: isDarkMode ? "#555" : "#c0aa88",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}
            >
              <FaArrowUp />
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default MessageInput;