import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const MessageFeed = ({ 
  messages, 
  showThinking, 
  thinkingPhrases, 
  phraseIndex, 
  messagesContainerRef, 
  showScrollToBottom, 
  scrollToBottom,
  setOpenMenuChatId // Adicionando a dependência ausente
}) => {
  // Debug: logar mensagens quando elas mudam e verificar se há mensagens do usuário
  useEffect(() => {
    console.log("Mensagens no feed:", messages);
    // Verificação adicional para garantir que a mensagem do usuário está sendo exibida
    const userMessages = messages?.filter(m => m?.role === "user") || [];
    if (userMessages.length > 0) {
      console.log("Mensagens do usuário encontradas:", userMessages);
    }

    // Quando o feed de mensagens atualiza, fechar qualquer menu de chat que esteja aberto
    if (setOpenMenuChatId) {
      setOpenMenuChatId(null);
    }
  }, [messages, setOpenMenuChatId]); // Adicionando a dependência ausente

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
              className={`message-standard message-equal-size rounded-lg text-sm ${message.role === "user" 
                ? "bg-accent text-accent-foreground" 
                : "bg-card border border-border/50"}`}
            >
              <div className="prose prose-sm dark:prose-invert max-w-full overflow-x-auto message-text">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Link com target _blank para abrir em nova aba - corrigindo problema de acessibilidade
                    a: ({node, children, ...props}) => (
                      <a 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        {...props}
                      >
                        {children || props.href || 'Link'}
                      </a>
                    ),
                    // Personalização do componente h1 - corrigindo problema de acessibilidade
                    h1: ({node, children, ...props}) => (
                      <h1 className="text-xl font-bold" {...props}>
                        {children || 'Título'}
                      </h1>
                    ),
                    // Personalização do componente h2 - corrigindo problema de acessibilidade
                    h2: ({node, children, ...props}) => (
                      <h2 className="text-lg font-semibold" {...props}>
                        {children || 'Subtítulo'}
                      </h2>
                    ),
                    // Personalização do componente h3 - corrigindo problema de acessibilidade
                    h3: ({node, children, ...props}) => (
                      <h3 className="text-base font-semibold" {...props}>
                        {children || 'Subtítulo'}
                      </h3>
                    ),
                    // Melhorando a formatação das tabelas
                    table: ({node, children, ...props}) => (
                      <div className="overflow-x-auto my-4 rounded-lg shadow-sm border border-border">
                        <table className="w-full border-collapse table-auto" {...props}>
                          {children}
                        </table>
                      </div>
                    ),
                    // Personalização para cabeçalhos de tabela com melhor UI/UX
                    thead: ({node, ...props}) => (
                      <thead className="bg-secondary/80" {...props} />
                    ),
                    // Personalização para cabeçalhos de tabela com melhor UI/UX
                    th: ({node, children, ...props}) => (
                      <th 
                        className="border border-border p-2 text-left font-medium"
                        {...props}
                      >
                        {children}
                      </th>
                    ),
                    // Personalização para linhas de tabela com melhor UI/UX
                    tr: ({node, children, ...props}) => (
                      <tr 
                        className="hover:bg-secondary/30 transition-colors"
                        {...props}
                      >
                        {children}
                      </tr>
                    ),
                    // Personalização para células de tabela com melhor UI/UX
                    td: ({node, children, ...props}) => (
                      <td 
                        className="border border-border p-2"
                        {...props}
                      >
                        {children}
                      </td>
                    ),
                    // Personalização para código
                    code: ({node, inline, children, ...props}) => (
                      inline
                        ? <code className="bg-muted text-sm px-1 py-0.5 rounded font-mono" {...props}>{children}</code>
                        : <pre className="bg-muted p-3 rounded-md overflow-x-auto"><code className="font-mono text-sm" {...props}>{children}</code></pre>
                    ),
                    // Personalização para blockquote
                    blockquote: ({node, children, ...props}) => (
                      <blockquote 
                        className="border-l-4 border-accent/50 pl-4 italic text-muted-foreground"
                        {...props}
                      >
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        );
      })}
      
      {showThinking && (
        <div className="flex justify-start">
          <div className="message-standard rounded-lg bg-card border border-border/50">
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
          className="sticky bottom-4 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground rounded-full p-2 shadow-md transition-opacity hover:bg-accent/90 z-10"
          aria-label="Rolar para o final da conversa"
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
