import React from "react";
import { FaArrowUp, FaEnvelope, FaHandPaper } from "react-icons/fa";

function InputArea({ 
  showInitialButtons, 
  handlePlanningButtonClick, 
  textareaRef, 
  inputValue, 
  setInputValue, 
  handleKeyDown, 
  handleInput, 
  handleEmailButton, 
  isThinking, 
  handleSendMessage,
  isDarkMode
}) {
  return (
    <div className="bottom-input">
      {showInitialButtons ? (
        <div className="initial-buttons-container">
          <button className="initial-button" onClick={() => handlePlanningButtonClick("Quero fazer um Planejamento Financeiro.")}>
            Quero fazer um Planejamento Financeiro
          </button>
        </div>
      ) : (
        <>
          <div className="bottom-input-bg" />
          <div className="new-input-box">
            <textarea
              ref={textareaRef}
              placeholder="Mensagem para o The Way"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              rows={1}
              className="message-textarea"
            />
            <div className="input-actions">
              <button
                className="action-button"
                onClick={handleEmailButton}
                disabled={isThinking}
                aria-label="Enviar por e-mail"
                style={{
                  cursor: isThinking ? "not-allowed" : "pointer",
                  color: isDarkMode ? "#ddd" : "#333"
                }}
              >
                <FaEnvelope />
              </button>
              {isThinking ? (
                <div
                  className="thinking-button"
                  aria-label="Aguardando processamento (não clicável)"
                  style={{
                    background: isDarkMode ? "#2e2e3e" : "#f5e8d6",
                    color: isDarkMode ? "#cecccc" : "#333"
                  }}
                >
                  <FaHandPaper />
                </div>
              ) : (
                <button
                  className="action-button send"
                  onClick={() => handleSendMessage()}
                  aria-label="Enviar mensagem"
                  style={{
                    color: isDarkMode ? "#ddd" : "#333"
                  }}
                >
                  <FaArrowUp />
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default InputArea;
