import React, { useEffect } from 'react';

const MessageFeed = ({ 
  messages, 
  showThinking, 
  thinkingPhrases, 
  phraseIndex, 
  messagesContainerRef, 
  showScrollToBottom, 
  scrollToBottom 
}) => {
  // Debug: logar mensagens quando elas mudam
  useEffect(() => {
    console.log("Mensagens no feed:", messages);
  }, [messages]);

  return (
    <div 
      ref={messagesContainerRef}
      className="flex-1 overflow-y-auto space-y-4 py-4 no-scrollbar"
    >
      {messages && messages.length > 0 && messages.map((message, index) => {
        // Verificamos que a mensagem é válida
        if (!message || !message.role || !message.content) {
          console.warn("Mensagem inválida no índice", index, message);
          return null;
        }
        
        return (
          <div 
            key={index}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div 
              className={`max-w-[80%] px-4 py-3 rounded-lg ${message.role === "user" 
                ? "bg-accent text-accent-foreground" 
                : "bg-card border border-border/50"}`}
            >
              <div 
                className="prose prose-sm dark:prose-invert"
                dangerouslySetInnerHTML={{ 
                  __html: message.content.replace(/\n/g, "<br>") 
                }} 
              />
            </div>
          </div>
        );
      })}
      
      {showThinking && (
        <div className="flex justify-start">
          <div className="max-w-[80%] px-4 py-3 rounded-lg bg-card border border-border/50">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span>{thinkingPhrases[phraseIndex]}</span>
              <div className="flex space-x-1">
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "0ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "300ms" }}></span>
                <span className="w-2 h-2 rounded-full bg-current animate-bounce" style={{ animationDelay: "600ms" }}></span>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Botão de rolagem para baixo */}
      {showScrollToBottom && (
        <button 
          onClick={scrollToBottom}
          className="sticky bottom-4 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground rounded-full p-2 shadow-md transition-opacity hover:bg-accent/90"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6"></path>
          </svg>
        </button>
      )}
    </div>
  );
};

export default MessageFeed;
