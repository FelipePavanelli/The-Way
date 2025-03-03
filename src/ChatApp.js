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
  FaEnvelope,
  FaSignOutAlt,
  FaChartLine,
  FaHubspot,
  FaDollarSign
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "./assets/logo.svg";
import "./index.css";

/** Gera nome único para o chat, ex. "Chat 1", "Chat 2" etc. */
function getUniqueChatName(chatList) {
  let maxNumber = 0;
  chatList.forEach((chat) => {
    const match = chat.name.match(/^Chat (\d+)$/);
    if (match) {
      const num = parseInt(match[1], 10);
      if (num > maxNumber) maxNumber = num;
    }
  });
  return `Chat ${maxNumber + 1}`;
}

/** Extrai a inicial do usuário (nome/nickname/email) */
function getUserInitial(user) {
  if (!user) return "z";
  const name = user.name || user.nickname || user.email || "z";
  return name.charAt(0).toUpperCase();
}

/** Mensagem inicial, usando nome do usuário, se disponível */
function getInitialMessage(user) {
  if (user) {
    const userName = user.name || user.nickname || user.email;
    return `Olá, ${userName}! No que posso te ajudar hoje?`;
  }
  return "Olá, no que posso te ajudar hoje?";
}
function ChatApp() {
  // Pega user e isAuthenticated do Auth0
  const { user, isAuthenticated, logout } = useAuth0();

  // =============== STATES ===============
  const [showChatList, setShowChatList] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);

  // (NOVO) Controle do menu do perfil (círculo)
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Lista de chats (persistido em localStorage)
  const [chatList, setChatList] = useState(() => {
    const stored = localStorage.getItem("chatList");
    return stored ? JSON.parse(stored) : [];
  });

  const [isDarkMode, setIsDarkMode] = useState(false);

  // sessionId local (ignora o que o servidor retorna)
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromURL = urlParams.get("chatId");
    const storedSessionId = localStorage.getItem("sessionId") || null;
    return chatIdFromURL || storedSessionId;
  });

  // Mensagens do chat atual
  const [messages, setMessages] = useState([
    // Colocamos algo padrão, mas será sobrescrito se não tiver localStorage
    // { role: "assistant", content: "Olá, no que posso te ajudar hoje?" }
  ]);

  // Input do usuário
  const [inputValue, setInputValue] = useState("");

  // Indicadores de “pensando”
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);

  // Efeito de digitação do assistente
  const [assistantFullText, setAssistantFullText] = useState("");
  const [assistantTypedText, setAssistantTypedText] = useState("");
  const typingIntervalRef = useRef(null);

  // Refs para scroll e clique-fora
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);

  // =============== LOCALSTORAGE FUNCS ===============
  function getStoredMessages(sid) {
    const raw = localStorage.getItem("messagesBySession");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed[sid] || [];
  }

  function storeMessages(sid, msgs) {
    const raw = localStorage.getItem("messagesBySession");
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sid] = msgs;
    localStorage.setItem("messagesBySession", JSON.stringify(parsed));
  }

  function removeMessagesForChatId(chatId) {
    const raw = localStorage.getItem("messagesBySession");
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[chatId];
    localStorage.setItem("messagesBySession", JSON.stringify(parsed));
  }

  // =============== USEEFFECTS ===============

  // 1) Se não houver sessionId, cria ou seleciona o primeiro chat
  useEffect(() => {
    if (!sessionId) {
      if (chatList.length > 0) {
        const firstChatId = chatList[0].id;
        setSessionId(firstChatId);
        localStorage.setItem("sessionId", firstChatId);
        updateURLWithChatId(firstChatId);
      } else {
        createNewSession();
      }
    } else {
      addChatToListIfMissing(sessionId);
      updateURLWithChatId(sessionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Salva chatList sempre que mudar
  useEffect(() => {
    localStorage.setItem("chatList", JSON.stringify(chatList));
  }, [chatList]);

  // 3) Carrega mensagens do localStorage sempre que sessionId mudar
  useEffect(() => {
    if (!sessionId) return;
    const stored = getStoredMessages(sessionId);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      // Se não houver nada salvo, define a mensagem inicial com nome do user
      setMessages([
        { role: "assistant", content: getInitialMessage(user) }
      ]);
    }
  }, [sessionId, user]);

  // 4) Salva mensagens no localStorage sempre que elas mudam
  useEffect(() => {
    if (sessionId) {
      storeMessages(sessionId, messages);
    }
  }, [messages, sessionId]);

  // 5) Efeito de digitação do assistente
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
    }, 5); // digitação rápida

    return () => {
      if (typingIntervalRef.current) {
        clearInterval(typingIntervalRef.current);
      }
    };
  }, [assistantFullText]);

  // 6) Atualiza a última msg do assistente durante a digitação
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

  // 7) Auto-scroll sempre que messages muda
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 8) Fecha sub-menu de chat ao clicar fora
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

  // (Opcional) Fecha menu de perfil ao clicar fora
  useEffect(() => {
    function handleClickOutsideProfile(e) {
      // Se o menu estiver aberto e não clicou nele, fecha
      if (showProfileMenu) {
        // Tente achar .profile-menu ou o botão
        const menuEl = document.getElementById("profile-menu-dropdown");
        if (menuEl && !menuEl.contains(e.target)) {
          setShowProfileMenu(false);
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutsideProfile);
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideProfile);
    };
  }, [showProfileMenu]);

  // =============== FUNÇÕES ===============
  function createNewSession() {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem("sessionId", newId);
    updateURLWithChatId(newId);

    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName };
    setChatList((prev) => [...prev, newChat]);
  }

  function addChatToListIfMissing(chatId) {
    const exists = chatList.some((chat) => chat.id === chatId);
    if (!exists) {
      const newChatName = getUniqueChatName(chatList);
      const newChat = { id: chatId, name: newChatName };
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
    removeMessagesForChatId(chatId);
    setOpenMenuChatId(null);

    if (sessionId === chatId) {
      createNewSession();
      setMessages([
        { role: "assistant", content: getInitialMessage(user) }
      ]);
    }
  }

  async function handleSendMessage(customMsg) {
    if (isThinking) return;

    const textToSend = customMsg || inputValue.trim();
    if (!textToSend) return;

    if (!customMsg) {
      setInputValue("");
      resetTextarea();
    }

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setIsThinking(true);
    setShowThinking(true);

    try {
      const response = await fetch("http://localhost:4000/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId,
          userName: user?.name || "",
          userId: user?.sub || "",
          userEmail: user?.email || ""
        })
      });
      const data = await response.json();
      let botReply = data.reply || "Erro: sem resposta.";

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

  // Botões iniciais se não houver msg de user
  const hasUserMessage = messages.some((m) => m.role === "user");
  const showInitialButtons = !hasUserMessage;

  function handlePlanningButtonClick(text) {
    handleSendMessage(text);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isThinking) {
        handleSendMessage();
      }
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
    if (!isThinking) {
      handleSendMessage("Enviar por e-mail.");
    }
  }

  // =============== RENDER ===============
  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* HEADER */}
      <div className="top-bar">
        <div className="top-bar-left">
          <img src={Logo} alt="logo" />
        </div>
        <div className="top-bar-center">
          <span className="the-way-label">The Way</span>
        </div>

        {/* TOP BAR RIGHT */}
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

          {/* BOTÃO DE PERFIL / MENU */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
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
              {isAuthenticated ? getUserInitial(user) : "z"}
            </button>

            {showProfileMenu && (
              <div
                id="profile-menu-dropdown"
                className="profile-menu"
                style={{
                  position: "absolute",
                  top: "3.2rem",
                  right: 0,
                  minWidth: "180px", // para evitar quebra de linha
                  background: isDarkMode ? "#2e2e3e" : "#f5e8d6",
                  border: isDarkMode ? "1px solid #444" : "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.3rem 0",
                      cursor: "pointer"
                    }}
                  >
                    <FaDollarSign />
                    AV Comissões
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.3rem 0",
                      cursor: "pointer"
                    }}
                  >
                    <FaChartLine />
                    TradeInsights
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.3rem 0",
                      cursor: "pointer"
                    }}
                  >
                    <FaHubspot />
                    HubSpot
                  </li>
                  <li
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      padding: "0.3rem 0",
                      cursor: "pointer",
                      color: "red",
                      fontWeight: "bold"
                    }}
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt />
                    Sair
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Painel de chats */}
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
                          style={{ color: isDarkMode ? "#fff" : "#333" }}
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

      {/* MAIN */}
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
                  <p style={{ whiteSpace: "pre-wrap" }}>{msg.content}</p>
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

      {/* FOOTER */}
      <div className="bottom-input">
        {showInitialButtons ? (
          <div className="initial-buttons-container">
            <button
              className="initial-button"
              onClick={() =>
                handlePlanningButtonClick(
                  "Quero fazer um Planejamento Financeiro passo a passo."
                )
              }
            >
              Quero fazer um Planejamento Financeiro passo a passo.
            </button>

            <button
              className="initial-button"
              onClick={() =>
                handlePlanningButtonClick(
                  "Quero fazer um Planejamento Financeiro no formato estruturado de uma vez."
                )
              }
            >
              Quero fazer um Planejamento Financeiro no formato estruturado de
              uma vez.
            </button>

            <button
              className="initial-button"
              onClick={() =>
                handlePlanningButtonClick(
                  "Quero fazer um Planejamento Financeiro em conversa livre."
                )
              }
            >
              Quero fazer um Planejamento Financeiro em conversa livre.
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
                disabled={isThinking}
                style={{
                  flex: 0.7,
                  marginRight: "0.5rem",
                  cursor: isThinking ? "not-allowed" : "text"
                }}
              />
              <div
                className="input-actions"
                style={{ flex: 0.3, display: "flex", gap: "0.5rem" }}
              >
                <FaEnvelope
                  onClick={handleEmailButton}
                  style={{
                    cursor: isThinking ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    color: isDarkMode ? "#ddd" : "#333"
                  }}
                />
                <FaArrowUp
                  className="send-icon"
                  onClick={() => {
                    if (!isThinking) {
                      handleSendMessage();
                    }
                  }}
                  style={{
                    fontSize: "1.2rem",
                    cursor: isThinking ? "not-allowed" : "pointer",
                    color: isDarkMode ? "#ddd" : "#333"
                  }}
                />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="footer-text">
        Todos os direitos reservados a Alta Vista Investimentos - V1.0.5
      </div>
    </div>
  );
}

export default ChatApp;
