import React, { useState, useEffect, useRef, useCallback } from "react";
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
  FaDollarSign,
  FaArrowDown,
  FaHandPaper
} from "react-icons/fa";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Logo from "./assets/logo.svg";
import "./index.css";

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

function getUserInitial(user) {
  if (!user) return "z";
  const name = user.name || user.nickname || user.email || "z";
  return name.charAt(0).toUpperCase();
}

function getInitialMessage(user) {
  if (user) {
    // const userName = user.name || user.nickname || user.email;
    return `Como posso te ajudar hoje?`;
  }
  return "Como posso te ajudar hoje?";
}

function ChatApp() {
  const { user, isAuthenticated, logout } = useAuth0();

  const [showChatList, setShowChatList] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [chatList, setChatList] = useState(() => {
    const stored = localStorage.getItem(`chatList_${user?.sub || user?.email || "default"}`);
    const parsed = stored ? JSON.parse(stored) : [];
    // Remove duplicatas de chatList baseado no ID
    const uniqueChats = Array.from(new Map(parsed.map(item => [item.id, item])).values());
    return uniqueChats;
  });
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromURL = urlParams.get("chatId");
    const storedSessionId = localStorage.getItem(`sessionId_${user?.sub || user?.email || "default"}`) || null;
    return chatIdFromURL || storedSessionId;
  });
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupInput, setPopupInput] = useState(""); // Para o input de renomear chat
  const [popupAction, setPopupAction] = useState(() => {});

  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);
  const popupRef = useRef(null); // Referência para o popup

  const getStoredMessages = useCallback((sid) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed[sid] || [];
  }, [user]);

  const storeMessages = useCallback((sid, msgs) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sid] = msgs;
    localStorage.setItem(`messagesBySession_${user?.sub || user?.email || "default"}`, JSON.stringify(parsed));
  }, [user]);

  const createNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);

    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName };
    setChatList((prev) => {
      const updatedList = [...prev, newChat];
      // Remove duplicatas baseado no ID
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
  }, [chatList, user]);

  const addChatToListIfMissing = useCallback((chatId) => {
    const exists = chatList.some((chat) => chat.id === chatId);
    if (!exists) {
      const newChatName = getUniqueChatName(chatList);
      const newChat = { id: chatId, name: newChatName };
      setChatList((prev) => {
        const updatedList = [...prev, newChat];
        // Remove duplicatas baseado no ID
        return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
      });
    }
  }, [chatList]);

  const removeMessagesForChatId = useCallback((chatId) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[chatId];
    localStorage.setItem(`messagesBySession_${user?.sub || user?.email || "default"}`, JSON.stringify(parsed));
  }, [user]);

  // 1) Se não houver sessionId, cria ou seleciona o primeiro chat
  useEffect(() => {
    if (!sessionId) {
      if (chatList.length > 0) {
        const firstChatId = chatList[0].id;
        setSessionId(firstChatId);
        localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, firstChatId);
        updateURLWithChatId(firstChatId);
      } else {
        createNewSession();
      }
    } else {
      addChatToListIfMissing(sessionId);
      updateURLWithChatId(sessionId);
    }
  }, [sessionId, chatList, user, addChatToListIfMissing, createNewSession]);

  // 2) Salva chatList sempre que mudar
  useEffect(() => {
    localStorage.setItem(`chatList_${user?.sub || user?.email || "default"}`, JSON.stringify(chatList));
  }, [chatList, user]);

  // 3) Carrega mensagens do localStorage sempre que sessionId mudar
  useEffect(() => {
    if (!sessionId) return;
    const stored = getStoredMessages(sessionId);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    }
  }, [sessionId, user, getStoredMessages]);

  // 4) Salva mensagens no localStorage sempre que elas mudam
  useEffect(() => {
    if (sessionId) {
      storeMessages(sessionId, messages);
    }
  }, [messages, sessionId, user, storeMessages]);

  // 5) Auto-scroll sempre que messages muda
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // 6) Fecha sub-menu de chat ao clicar fora, corrigido para verificar se o elemento existe e lidar com hot-reload
  useEffect(() => {
    let timeoutId = null;

    if (openMenuChatId && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!chatListPanelRef.current.contains(e.target)) {
          setOpenMenuChatId(null);
        }
      }

      // Adiciona o listener após um pequeno delay para garantir que o elemento esteja no DOM
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [openMenuChatId]);

  // 7) Fecha menu de chats (hambúrguer) ao clicar fora, corrigido para verificar se o elemento existe
  useEffect(() => {
    let timeoutId = null;

    if (showChatList && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!chatListPanelRef.current.contains(e.target)) {
          setShowChatList(false);
        }
      }

      // Adiciona o listener após um pequeno delay para garantir que o elemento esteja no DOM
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);

      return () => {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showChatList]);

  // 8) Fecha menu de perfil ao clicar fora
  useEffect(() => {
    if (showProfileMenu) {
      function handleClickOutsideProfile(e) {
        const menuEl = document.getElementById("profile-menu-dropdown");
        if (menuEl && !menuEl.contains(e.target)) {
          setShowProfileMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutsideProfile);
      return () => document.removeEventListener("mousedown", handleClickOutsideProfile);
    }
  }, [showProfileMenu]);

  // 9) Controle de rolagem para mostrar a seta de voltar ao fim
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        setShowScrollToBottom(!isScrolledToBottom);
      }
    };
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // 10) Fechar popup ao clicar fora, com handleClickOutside definido no escopo do componente
  const handleClickOutside = useCallback((e) => {
    if (popupRef.current && !popupRef.current.contains(e.target)) {
      setShowPopup(false);
      setPopupInput(""); // Reseta o input ao fechar
    }
  }, []);

  useEffect(() => {
    let timeoutId = null;

    if (showPopup) {
      // Verifica se popupRef.current existe antes de adicionar o listener
      function checkAndAddListener() {
        if (popupRef.current) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          // Se o elemento ainda não existir, tenta novamente após um pequeno delay
          timeoutId = setTimeout(checkAndAddListener, 50);
        }
      }

      checkAndAddListener();

      return () => {
        // Limpa o listener e o timeout
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }

    // Limpa o timeout se showPopup for false
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [showPopup, handleClickOutside]);

  function updateURLWithChatId(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("chatId", id);
    window.history.replaceState({}, "", url.toString());
  }

  function handleSelectChat(chatId) {
    setSessionId(chatId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, chatId);
    updateURLWithChatId(chatId);
    setOpenMenuChatId(null);
    setShowChatList(false);
  }

  function handleRenameChat(chatId) {
    setShowPopup(true);
    setPopupMessage("Qual o nome deseja dar ao Chat?");
    setPopupInput(""); // Reseta o input
    setPopupAction(() => () => {
      if (popupInput.trim()) {
        setChatList((prev) =>
          prev.map((chat) => (chat.id === chatId ? { ...chat, name: popupInput.trim() } : chat))
        );
      }
      setShowPopup(false); // Fecha o popup após a ação
      setOpenMenuChatId(null);
    });
  }

  function handleDeleteChat(chatId) {
    setShowPopup(true);
    setPopupMessage("Deseja realmente excluir este chat?");
    setPopupAction(() => () => {
      if (window.confirm("Confirme a exclusão deste chat?")) {
        setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
        removeMessagesForChatId(chatId);
        setOpenMenuChatId(null);

        if (sessionId === chatId) {
          setSessionId(null);
          setMessages([]);
        }
      }
      setShowPopup(false); // Fecha o popup após a ação
    });
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

      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (err) {
      console.error("Erro ao chamar /api/agent:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro ao obter a resposta." }
      ]);
    } finally {
      setIsThinking(false);
      setShowThinking(false);
    }
  }

  const hasUserMessage = messages.some((m) => m.role === "user");
  const showInitialButtons = !hasUserMessage;

  function handlePlanningButtonClick(text) {
    handleSendMessage(text);
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !isThinking) {
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
    setShowPopup(true);
    setPopupMessage("Deseja realmente sair?");
    setPopupAction(() => () => {
      logout({ returnTo: window.location.origin });
      setShowPopup(false);
    });
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
      setShowPopup(true);
      setPopupMessage("Deseja receber por e-mail?");
      setPopupAction(() => () => {
        handleSendMessage("Enviar por e-mail.");
        setShowPopup(false);
      });
    }
  }

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }

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
            aria-label="Abrir menu de chats"
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
              aria-label={isAuthenticated ? `Perfil de ${user.name || "usuário"}` : "Perfil"}
              aria-expanded={showProfileMenu}
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
                  minWidth: "180px",
                  background: isDarkMode ? "#2e2e3e" : "#f5e8d6",
                  border: isDarkMode ? "1px solid #444" : "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "0.5rem 1rem",
                  boxShadow: "0 4px 8px rgba(0,0,0,0.2)"
                }}
              >
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", cursor: "pointer", fontFamily: '"Inter", sans-serif', fontWeight: 400 }}>
                    <FaDollarSign /> AV Comissões
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", cursor: "pointer", fontFamily: '"Inter", sans-serif', fontWeight: 400 }}>
                    <FaChartLine /> TradeInsights
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", cursor: "pointer", fontFamily: '"Inter", sans-serif', fontWeight: 400 }}>
                    <FaHubspot /> HubSpot
                  </li>
                  <li style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.3rem 0", cursor: "pointer", color: "red", fontWeight: "bold", fontFamily: '"Inter", sans-serif' }} onClick={handleLogout}>
                    <FaSignOutAlt /> Sair
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
              <li key={chat.id}> {/* Usando chat.id como chave única */}
                <div className="chat-item" onClick={() => handleSelectChat(chat.id)}>
                  <span>{chat.name}</span>
                  <div className="chat-item-menu" onClick={(e) => toggleMenu(chat.id, e)}>
                    <FaEllipsisV />
                  </div>
                  {openMenuChatId === chat.id && (
                    <div className="chat-item-dropdown" style={{ display: "block", zIndex: 9999999 }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => handleRenameChat(chat.id)}>
                        <FaPencilAlt style={{ color: isDarkMode ? "#fff" : "#333" }} /> Renomear
                      </button>
                      <button onClick={() => handleDeleteChat(chat.id)}>
                        <FaTrash style={{ color: "red" }} /> Excluir
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

      {/* MAIN com seta de voltar ao fim */}
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
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
        </div>
        {showScrollToBottom && (
          <button
            onClick={scrollToBottom}
            style={{
              position: "fixed",
              bottom: "80px",
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
      </div>

      {/* FOOTER com botão Stop */}
      <div className="bottom-input">
        {showInitialButtons ? (
          <div className="initial-buttons-container">
            <button className="initial-button" onClick={() => handlePlanningButtonClick("Quero fazer um Planejamento Financeiro passo a passo.")}>
              Quero fazer um Planejamento Financeiro passo a passo.
            </button>
            <button className="initial-button" onClick={() => handlePlanningButtonClick("Quero fazer um Planejamento Financeiro no formato estruturado de uma vez.")}>
              Quero fazer um Planejamento Financeiro no formato estruturado de uma vez.
            </button>
            <button className="initial-button" onClick={() => handlePlanningButtonClick("Quero fazer um Planejamento Financeiro em conversa livre.")}>
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
                  cursor: isThinking ? "not-allowed" : "text",
                  fontFamily: '"Inter", sans-serif',
                  fontSize: "1rem",
                  fontWeight: 400
                }}
              />
              <div className="input-actions" style={{ flex: 0.3, display: "flex", gap: "0.5rem" }}>
                <FaEnvelope
                  onClick={handleEmailButton}
                  style={{
                    cursor: isThinking ? "not-allowed" : "pointer",
                    fontSize: "1.2rem",
                    color: isDarkMode ? "#ddd" : "#333"
                  }}
                />
                {isThinking ? (
                  <div
                    style={{
                      background: isDarkMode ? "#2e2e3e" : "#f5e8d6",
                      border: "2px solid var(--border-color)",
                      borderRadius: "4px",
                      width: "40px",
                      height: "40px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: isDarkMode ? "#cecccc" : "#333",
                      fontSize: "1.2rem",
                      cursor: "default" // Não clicável
                    }}
                    aria-label="Aguardando processamento (não clicável)"
                  >
                    <FaHandPaper />
                  </div>
                ) : (
                  <FaArrowUp
                    className="send-icon"
                    onClick={() => handleSendMessage()}
                    style={{
                      fontSize: "1.2rem",
                      cursor: "pointer",
                      color: isDarkMode ? "#ddd" : "#333"
                    }}
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Popup personalizado */}
      {showPopup && (
        <div className="popup-overlay" onClick={() => { setShowPopup(false); setPopupInput(""); }}>
          <div id="custom-popup" ref={popupRef} className="custom-popup" onClick={(e) => e.stopPropagation()}>
            <p>{popupMessage}</p>
            {popupMessage === "Qual o nome deseja dar ao Chat?" ? (
              <input
                type="text"
                value={popupInput}
                onChange={(e) => setPopupInput(e.target.value)}
                placeholder="Digite o nome do chat"
                className="popup-input"
                autoFocus
              />
            ) : null}
            <div className="popup-actions">
              <button className="popup-button" onClick={() => { setShowPopup(false); setPopupInput(""); setPopupAction(() => {}); }}>
                Cancelar
              </button>
              <button
                className="popup-button confirm"
                onClick={() => {
                  popupAction();
                  setShowPopup(false); // Fecha o popup imediatamente após a ação
                  setPopupInput("");
                  setPopupAction(() => {});
                }}
                disabled={popupMessage === "Qual o nome deseja dar ao Chat?" && !popupInput.trim()}
              >
                {popupMessage === "Deseja receber por e-mail?" ? "Show me The Way" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-text" style={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.6rem" }}>
        Todos os direitos reservados a Alta Vista Investimentos - V1.0.6
      </div>
    </div>
  );
}

export default ChatApp;