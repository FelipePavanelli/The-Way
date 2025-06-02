import React from "react";
import { FaArrowUp, FaFileAlt } from "react-icons/fa";

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
    <footer className="app-footer">
      <div className="input-container">
        <div className={`initial-buttons ${!showInitialButtons ? 'hidden' : ''}`} id="initial-buttons">
          <button 
            className="suggestion-button" 
            onClick={() => handlePlanningButtonClick("Quero fazer um Planejamento Financeiro passo a passo.")}
          >
            Planejamento Financeiro passo a passo
          </button>
        </div>

        <div className={`message-input-container ${!showInitialButtons ? 'visible' : ''}`} id="message-input-container">
          <div className="input-wrapper">
            <textarea 
              ref={textareaRef}
              id="message-input"
              placeholder="Mensagem para o The Way" 
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onInput={handleInput}
              aria-label="Digite sua mensagem"
            />
            <div className="input-actions">
              <a 
                href="#" 
                target="_blank"
                className="action-button report-button" 
                aria-label="Gerar Relatório"
                onClick={(e) => {
                  e.preventDefault();
                  handleEmailButton();
                }}
              >
                <FaFileAlt aria-hidden="true" />
                <span className="report-text">Gerar Relatório</span>
              </a>
              <button 
                className="action-button send-button" 
                id="send-button" 
                onClick={() => handleSendMessage()}
                disabled={isThinking}
                aria-label="Enviar mensagem"
              >
                <FaArrowUp aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-credits">
        <p>Powered By Alta Vista Investimentos - V1.2.0</p>
      </div>
    </footer>
  );
}

export default InputArea;