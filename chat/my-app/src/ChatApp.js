// src/ChatApp.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { FaArrowUp } from "react-icons/fa";
import { FaMoon, FaSun } from "react-icons/fa"; // Ícones de lua/sol
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "./assets/logo.svg";
import "./index.css";

function ChatApp() {
  const { logout } = useAuth0();

  // Estado para controlar o tema (true => dark mode, false => light mode)
  const [isDarkMode, setIsDarkMode] = useState(false);

  // SessionId e mensagens
  const [sessionId, setSessionId] = useState(() => {
    return localStorage.getItem("sessionId") || null;
  });
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá Pavanelli, no que posso te ajudar hoje?" }
  ]);

  // Input e estados auxiliares
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // Efeito de digitação
  const [assistantFullText, setAssistantFullText] = useState("");
  const [assistantTypedText, setAssistantTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  // Referências
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);

  // Efeito: digitação do texto do bot
  useEffect(() => {
    if (!assistantFullText) return;

    setAssistantTypedText("");
    if (typingIntervalRef.current) {
      clearInterval(typingIntervalRef.current);
    }

    let index = 0;
    typingIntervalRef.current = setInterval(() => {
      if (index < assistantFullText.length) {
        setAssistantTypedText((prev) => prev + assistantFullText[index]);
        index++;
      } else {
        setAssistantTypedText(assistantFullText);
        clearInterval(typingIntervalRef.current);
        typingIntervalRef.current = null;
      }
    }, 10);

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [assistantFullText]);

  // Efeito: toda vez que assistantTypedText muda, atualiza a última mensagem do assistente
  useEffect(() => {
    if (!assistantTypedText) return;
    setMessages((prev) => {
      const updated = [...prev];
      const idx = updated.map((m) => m.role).lastIndexOf("assistant");
      if (idx !== -1) {
        updated[idx] = { ...updated[idx], content: assistantTypedText };
      }
      return updated;
    });
  }, [assistantTypedText]);

  // Efeito: auto-scroll sempre que 'messages' mudar
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Função para enviar mensagem
  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userText = inputValue;
    setInputValue("");
    resetTextarea();

    setMessages((prev) => [...prev, { role: "user", content: userText }]);

    setIsThinking(true);
    setShowThinking(true);

    try {
      const response = await fetch("http://localhost:3001/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          sessionId: sessionId
        })
      });
      const data = await response.json();

      let botReply = data.reply || "Erro: sem resposta.";

      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
      }

      setMessages((prev) => [...prev, { role: "assistant", content: "" }]);
      setAssistantFullText(botReply);
    } catch (err) {
      console.error("Erro ao chamar /api/agent:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro ao obter a resposta." }
      ]);
    } finally {
      setIsThinking(false);
      setTimeout(() => {
        setShowThinking(false);
      }, 300);
    }
  };

  // SHIFT+Enter => nova linha, Enter => enviar
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Auto-expansão do textarea
  const handleInput = (e) => {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  };

  // Reseta altura do textarea
  const resetTextarea = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // Logout
  const handleLogout = () => {
    logout({ returnTo: window.location.origin });
  };

  // Toggle Dark/Light Mode
  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    // Aplica a classe "dark-mode" ou "light-mode" na div container
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Barra superior */}
      <div className="top-bar">
      <div className="top-bar-left">
      <img src={Logo} alt="logo" />
      </div>
      <div className="top-bar-center">
        <span className="the-way-label">The Way</span>
      </div>
      <div className="top-bar-right">

        {/* Botões no canto direito */}
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={toggleDarkMode}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            {isDarkMode ? <FaSun /> : <FaMoon />}
          </button>

          <button
            onClick={handleLogout}
            style={{
              background: "#f5e8d6",
              border: "none",
              borderRadius: "9999px",
              width: "2.5rem",
              height: "2.5rem",
              boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
              color: "#333",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            F
          </button>
        </div>
      </div>
      </div>

      {/* Área principal */}
      <div className="main">
        <div className="messages-feed" ref={messagesContainerRef}>
          {messages.map((msg, index) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={index}
                className={
                  isUser
                    ? "message user-message"
                    : "message assistant-message fade-in"
                }
              >
                {isUser ? (
                  <p>{msg.content}</p>
                ) : (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.content}
                  </ReactMarkdown>
                )}
              </div>
            );
          })}

          {/* Se showThinking => animação de “digitando” */}
          {showThinking && (
            <div className="message assistant-message fade-in">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Barra inferior (com 2 retângulos) */}
      <div className="bottom-input">
        <div className="bottom-input-bg" />
        <div className="new-input-box">
          <div className="left-spacer" />
          <textarea
            ref={textareaRef}
            placeholder="Mensagem para o The Way"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            rows={1}
          />
          <FaArrowUp className="send-icon" onClick={handleSendMessage} />
        </div>
      </div>

      <div className="footer-text">
        Todos os direitos reservados a Alta Vista Investimentos - V1.0.0
      </div>
    </div>
  );
}

export default ChatApp;
