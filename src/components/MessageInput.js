import React from 'react';

const MessageInput = ({ 
  inputValue, 
  setInputValue, 
  handleInput, 
  handleKeyDown, 
  handleSendMessage, 
  handleEmailButton, 
  isThinking, 
  textareaRef 
}) => {
  return (
    <div className="mt-4">
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          disabled={isThinking}
          className="w-full p-3 pr-20 bg-card border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[50px] max-h-[200px]"
          rows="1"
        ></textarea>
        
        <div className="absolute right-2 bottom-2 flex gap-2">
          {/* Botão de e-mail (versão final) */}
          <button
            onClick={handleEmailButton}
            className="p-2 rounded-md hover:bg-secondary/80 transition-colors text-muted-foreground hover:text-foreground"
            disabled={isThinking}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="20" height="16" x="2" y="4" rx="2"></rect>
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path>
            </svg>
          </button>
          
          {/* Botão de enviar */}
          <button
            onClick={() => handleSendMessage()}
            disabled={isThinking || !inputValue.trim()}
            className={`p-2 rounded-md ${inputValue.trim() && !isThinking 
              ? "bg-accent text-accent-foreground hover:bg-accent/90" 
              : "bg-secondary/50 text-muted-foreground cursor-not-allowed"} transition-colors`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m22 2-7 20-4-9-9-4Z"></path>
              <path d="M22 2 11 13"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageInput;
