import React, { useEffect, useState } from 'react';

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
  // Estado para controlar o foco do textarea
  const [isFocused, setIsFocused] = useState(true);
  
  // Efeito para remover qualquer estilo translucido quando o componente inicializa
  useEffect(() => {
    const ensureSolidAppearance = () => {
      if (textareaRef && textareaRef.current) {
        textareaRef.current.style.opacity = "1";
        textareaRef.current.style.backgroundColor = "white";
        
        // Para o tema escuro
        if (document.documentElement.classList.contains('dark')) {
          textareaRef.current.style.backgroundColor = "hsl(210, 70%, 15%)";
          textareaRef.current.style.color = "hsl(220, 15%, 93%)";
        } else {
          textareaRef.current.style.color = "black";
        }
      }
    };
    
    ensureSolidAppearance();
    
    // Verificar e corrigir quando o estado de readOnly muda
    const checkInterval = setInterval(ensureSolidAppearance, 500);
    
    return () => clearInterval(checkInterval);
  }, [textareaRef, isThinking]);
  useEffect(() => {
    // Função para focar no textarea e garantir que o cursor continue piscando
    const focusTextarea = () => {
      if (textareaRef && textareaRef.current) {
        textareaRef.current.focus();
        setIsFocused(true);
      }
    };
    
    // Focar inicialmente
    focusTextarea();
    
    // Configurar verificação periódica para garantir que o foco seja mantido
    const focusInterval = setInterval(() => {
      // Verifica se o elemento ativo não é o textarea
      if (document.activeElement !== textareaRef.current) {
        focusTextarea();
      }
    }, 1000); // Verifica a cada segundo
    
    // Adicionar listener para eventos de clique na janela
    const handleWindowClick = (e) => {
      // Verificar se o clique foi em elementos de controle (botões, menus) para não interferir
      const isControlElement = e.target.closest('button') || e.target.closest('.header') || e.target.closest('.chat-list');
      
      // Se não for um elemento de controle ou se for no próprio componente de chat, manter foco
      if (!isControlElement || e.target.closest('.message-feed')) {
        // Pequeno atraso para permitir que outros elementos recebam cliques antes de redirecionar o foco
        setTimeout(focusTextarea, 100);
      }
    };
    
    window.addEventListener('click', handleWindowClick);
    
    // Limpar intervalos e event listeners
    return () => {
      clearInterval(focusInterval);
      window.removeEventListener('click', handleWindowClick);
    };
  }, [textareaRef]); // Dependência apenas do textareaRef
  return (
    <div className="message-input-container">
      <div className="flex message-input-flex justify-center items-center space-x-3">
        <div className="relative w-[550px] max-w-full">
          <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          readOnly={isThinking} // Usando readOnly em vez de disabled para manter o cursor visível
          className={`w-full p-3 pr-16 bg-card border border-border/50 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-accent/50 min-h-[40px] max-h-[120px] caret-accent solid-textarea ${isFocused ? 'focused-textarea' : ''}`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          rows="1"
        ></textarea>
        
        <div className="absolute right-3.5 bottom-3.5 flex gap-2">
          {/* Botão de enviar */}
          <button
            onClick={(e) => {
              e.preventDefault();
              handleSendMessage();
              // Focar novamente no textarea após a ação
              setTimeout(() => {
                if (textareaRef && textareaRef.current) {
                  textareaRef.current.focus();
                }
              }, 100);
            }}
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
        
        {/* Botão Gerar Relatório fora da caixa principal */}
        <button
          onClick={(e) => {
            e.preventDefault();
            handleEmailButton();
            // Focar novamente no textarea após a ação
            setTimeout(() => {
              if (textareaRef && textareaRef.current) {
                textareaRef.current.focus();
              }
            }, 100);
          }}
          className="report-button py-2 px-4 bg-accent text-white font-medium rounded-lg hover:bg-accent/90 transition-colors"
          disabled={isThinking}
        >
          <div className="inline-flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <path d="M14 2v6h6"></path>
              <path d="M16 13H8"></path>
              <path d="M16 17H8"></path>
              <path d="M10 9H8"></path>
            </svg>
            <span className="ml-2">Gerar relatório</span>
          </div>
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
