// src/ChatApp.js
import React, { useState, useEffect, useRef } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import {
  FaArrowUp,
  FaMoon,
  FaSun,
  FaBars,
  FaEllipsisV,
  FaPencilAlt,
  FaTrash,
  FaEnvelope
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "./assets/logo.svg";
import "./index.css";

function ChatApp() {
  const { logout } = useAuth0();

  // =============== STATES ===============
  const [showChatList, setShowChatList] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [chatList, setChatList] = useState(() => {
    const stored = localStorage.getItem("chatList");
    return stored ? JSON.parse(stored) : [];
  });
  const [isDarkMode, setIsDarkMode] = useState(false);

  // ID do chat atual
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromURL = urlParams.get("chatId");
    const storedSessionId = localStorage.getItem("sessionId") || null;
    return chatIdFromURL || storedSessionId;
  });

  // Mensagens
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Olá Rogério, no que posso te ajudar hoje?" }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // Efeito de digitação
  const [assistantFullText, setAssistantFullText] = useState("");
  const [assistantTypedText, setAssistantTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  // Refs
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);

  // =============== EFFECTS ===============
  // 1) Se não houver sessionId, cria ou usa o primeiro da lista
  useEffect(() => {
    if (!sessionId) {
      if (chatList.length > 0) {
        setSessionId(chatList[0].id);
        updateURLWithChatId(chatList[0].id);
      } else {
        createNewSession();
      }
    } else {
      addChatToListIfMissing(sessionId);
      updateURLWithChatId(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Salva chatList no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem("chatList", JSON.stringify(chatList));
  }, [chatList]);

  // 3) Efeito de digitação do assistente
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

  // 4) Atualiza a última msg do assistente enquanto digita
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

  // 5) Auto-scroll ao atualizar messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 6) Fecha sub-menu ao clicar fora
  useEffect(() => {
    function handleClickOutside(e) {
      if (openMenuChatId && chatListPanelRef.current) {
        if (!chatListPanelRef.current.contains(e.target)) {
          setOpenMenuChatId(null);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [openMenuChatId]);

  // =============== FUNÇÕES ===============
  function createNewSession() {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem("sessionId", newId);
    updateURLWithChatId(newId);
    addChatToListIfMissing(newId);
  }

  function addChatToListIfMissing(chatId) {
    const exists = chatList.some((chat) => chat.id === chatId);
    if (!exists) {
      const newChat = {
        id: chatId,
        name: `Chat ${chatList.length + 1}`
      };
      setChatList((prev) => [...prev, newChat]);
    }
  }

  function updateURLWithChatId(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("chatId", id);
    window.history.replaceState({}, "", url.toString());
  }

  function handleSelectChat(chatId) {
    setSessionId(chatId);
    localStorage.setItem("sessionId", chatId);
    updateURLWithChatId(chatId);

    setMessages([
      {
        role: "assistant",
        content: "Olá Pavanelli, no que posso te ajudar hoje?"
      }
    ]);
    setOpenMenuChatId(null);
    setShowChatList(false);
  }

  function handleRenameChat(chatId) {
    const newName = prompt("Novo nome do chat:");
    if (!newName) return;
    setChatList((prev) =>
      prev.map((chat) => {
        if (chat.id === chatId) {
          return { ...chat, name: newName };
        }
        return chat;
      })
    );
    setOpenMenuChatId(null);
  }

  function handleDeleteChat(chatId) {
    if (!window.confirm("Deseja realmente excluir este chat?")) return;
    setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
    setOpenMenuChatId(null);
    if (sessionId === chatId) {
      createNewSession();
      setMessages([
        {
          role: "assistant",
          content: "Olá Pavanelli, no que posso te ajudar hoje?"
        }
      ]);
    }
  }

  async function handleSendMessage(customMsg) {
    const textToSend = customMsg || inputValue.trim();
    if (!textToSend) return;

    if (!customMsg) {
      setInputValue("");
      resetTextarea();
    }

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setIsThinking(true);
    setShowThinking(true);
// Local
    try {
    //   const response = await fetch("http://localhost:4000/api/agent", {
    // try {
//Prod
      const response = await fetch("https://api.theway.altavistainvest.com.br/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId
        })
      });
      const data = await response.json();
      let botReply = data.reply || "Erro: sem resposta.";

      if (data.sessionId) {
        setSessionId(data.sessionId);
        localStorage.setItem("sessionId", data.sessionId);
        updateURLWithChatId(data.sessionId);
        addChatToListIfMissing(data.sessionId);
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
      setTimeout(() => setShowThinking(false), 300);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleInput(e) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function resetTextarea() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  function handleLogout() {
    logout({ returnTo: window.location.origin });
  }

  function toggleDarkMode() {
    setIsDarkMode((prev) => !prev);
  }

  function toggleMenu(chatId, e) {
    e.stopPropagation();
    setOpenMenuChatId((prev) => (prev === chatId ? null : chatId));
  }

  function handleEmailButton() {
    handleSendMessage("Enviar por e-mail.");
  }

  // =============== RENDER ===============
  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* HEADER fixo */}
      <div className="top-bar">
        <div className="top-bar-left">
          <img src={Logo} alt="logo" />
        </div>
        <div className="top-bar-center">
          <span className="the-way-label">The Way</span>
        </div>
        <div className="top-bar-right">
          <button
            onClick={() => setShowChatList(!showChatList)}
            style={{
              background: "transparent",
              border: "none",
              color: "inherit",
              cursor: "pointer",
              fontSize: "1.2rem"
            }}
          >
            <FaBars />
          </button>
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

      {/* Painel de chats (lado direito) */}
      {showChatList && (
        <div className="chat-list-panel" ref={chatListPanelRef}>
          <h3>Meus Chats</h3>
          <ul>
            {chatList.map((chat) => (
              <li key={chat.id}>
                <div className="chat-item" onClick={() => handleSelectChat(chat.id)}>
                  <span>{chat.name}</span>
                  <div
                    className="chat-item-menu"
                    onClick={(e) => toggleMenu(chat.id, e)}
                  >
                    <FaEllipsisV />
                  </div>
                  {openMenuChatId === chat.id && (
                    <div
                      className="chat-item-dropdown"
                      style={{ display: "block", zIndex: 9999999 }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button onClick={() => handleRenameChat(chat.id)}>
                        <FaPencilAlt
                          style={{
                            color: isDarkMode ? "#fff" : "#333"
                          }}
                        />
                        Renomear
                      </button>
                      <button onClick={() => handleDeleteChat(chat.id)}>
                        <FaTrash style={{ color: "red" }} />
                        Excluir
                      </button>
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <button onClick={createNewSession} className="new-chat-button">
            + Novo Chat
          </button>
        </div>
      )}

      {/* MAIN (rolável via .messages-feed) */}
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

          {/* "Digitando..." */}
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

      {/* Barra inferior sempre visível */}
      <div className="bottom-input">
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
            style={{ flex: 0.7, marginRight: "0.5rem" }}
          />
          <div
            className="input-actions"
            style={{ flex: 0.3, display: "flex", gap: "0.5rem" }}
          >
            <FaEnvelope
              onClick={handleEmailButton}
              style={{
                cursor: "pointer",
                fontSize: "1.2rem",
                color: isDarkMode ? "#ddd" : "#333"
              }}
            />
            <FaArrowUp
              className="send-icon"
              onClick={() => handleSendMessage()}
              style={{
                fontSize: "1.2rem",
                cursor: "pointer",
                color: isDarkMode ? "#ddd" : "#333"
              }}
            />
          </div>
        </div>
      </div>

      {/* FOOTER fixo no final */}
      <div className="footer-text">
        Todos os direitos reservados a Alta Vista Investimentos - V1.0.0
      </div>
    </div>
  );
}

export default ChatApp;
