import React from "react";
import { FaArrowDown } from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

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
    <div className="main">
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
          className="scroll-to-bottom-button"
          aria-label="Voltar ao fim da conversa"
          style={{
            background: isDarkMode ? "#4d4d4d" : "#d6c3a9",
            color: isDarkMode ? "#fff" : "#333"
          }}
        >
          <FaArrowDown />
        </button>
      )}
    </div>
  );
}

export default MessageFeed;
