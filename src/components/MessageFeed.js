import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FaArrowDown } from 'react-icons/fa';

function MessageFeed({ 
  messages, 
  showThinking, 
  thinkingPhrases, 
  phraseIndex, 
  messagesContainerRef, 
  showScrollToBottom,
  scrollToBottom,
  isDarkMode
}) {
  return (
    <>
      <div className="messages-feed" ref={messagesContainerRef}>
        {messages.map((msg, index) => (
          <div key={index} className={msg.role === "user" ? "message user-message" : "message assistant-message fade-in"}>
            {msg.role === "user" ? (
              <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
            ) : (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.content}</ReactMarkdown>
            )}
          </div>
        ))}
        {showThinking && (
          <div className="message assistant-message fade-in">
            <div className="typing-indicator">
              <span className="typing-text">{thinkingPhrases[phraseIndex]}</span>
              <div className="dots-container">
                <span className="dot"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </div>
        )}
      </div>
      {showScrollToBottom && (
        <button
          onClick={scrollToBottom}
          style={{
            position: "fixed",
            bottom: "120px",
            right: "20px",
            background: isDarkMode ? "#4d4d4d" : "#d6c3a9",
            border: "none",
            borderRadius: "50%",
            width: "40px",
            height: "40px",
            cursor: "pointer",
            color: isDarkMode ? "#fff" : "#333",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.2rem"
          }}
          aria-label="Voltar ao fim da conversa"
        >
          <FaArrowDown />
        </button>
      )}
    </>
  );
}

export default MessageFeed;