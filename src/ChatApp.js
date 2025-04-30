import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Logo from "./assets/logo.svg";
import "./index.css";

// Importação dos componentes
import ChatHeader from "./components/ChatHeader";
import ChatList from "./components/ChatList";
import MessageFeed from "./components/MessageFeed";
import InitialButtons from "./components/InitialButtons";
import MessageInput from "./components/MessageInput";
import Popup from "./components/Popup";

// Função auxiliar para verificar se um elemento contém outro de forma segura
function safeContains(element, target) {
  try {
    return element && typeof element.contains === 'function' && element.contains(target);
  } catch (error) {
    console.error("Erro ao verificar contains:", error);
    return false;
  }
}

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
  const [popupInput, setPopupInput] = useState("");
  
  // Estado adicional para rastrear o chat que está sendo renomeado
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [popupType, setPopupType] = useState(""); // "rename", "delete", "email", "logout"
  
  // Novo estado para controlar o índice da frase de pensamento
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  // Estado para controlar qual API usar
  const [useAV, setUseAV] = useState(false);
  
  // Estado para forçar a exibição do chat
  const [forceShowChat, setForceShowChat] = useState(false);
  
  // Array de frases de pensamento
  const thinkingPhrases = [
    "Pensando...",
    "Analisando sua mensagem...",
    "Processando informações...",
    "Elaborando resposta...",
    "Considerando opções...",
    "Avaliando alternativas...",
    "Organizando dados...",
    "Calculando resultados..."
  ];

  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);
  const popupRef = useRef(null);

  // Efeito para alternar as frases de pensamento
  useEffect(() => {
    let interval;
    if (showThinking) {
      interval = setInterval(() => {
        setPhraseIndex((prevIndex) => (prevIndex + 1) % thinkingPhrases.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showThinking, thinkingPhrases.length]);
  
  useEffect(() => {
    // Ao inicializar, garantir que estamos sempre na tela inicial
    setForceShowChat(false);
    
    // Se não tivermos mensagens de usuário, sempre deve mostrar os botões iniciais
    if (!messages.some(m => m.role === "user")) {
      setForceShowChat(false);
    }
  }, []); // Executa apenas uma vez na montagem do componente

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
    // Criar novo ID
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);

    // Adicionar à lista de chats
    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName };
    setChatList((prev) => {
      const updatedList = [...prev, newChat];
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
    
    // Resetar para a tela inicial com os botões
    setForceShowChat(false);
    setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
  }, [chatList, user]);

  const addChatToListIfMissing = useCallback((chatId) => {
    const exists = chatList.some((chat) => chat.id === chatId);
    if (!exists) {
      const newChatName = getUniqueChatName(chatList);
      const newChat = { id: chatId, name: newChatName };
      setChatList((prev) => {
        const updatedList = [...prev, newChat];
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

  const handleClickOutside = useCallback((e) => {
    if (!safeContains(popupRef.current, e.target)) {
      setShowPopup(false);
      setPopupInput("");
      setRenamingChatId(null);
      setDeletingChatId(null);
    }
  }, []);

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

  useEffect(() => {
    localStorage.setItem(`chatList_${user?.sub || user?.email || "default"}`, JSON.stringify(chatList));
  }, [chatList, user]);

  useEffect(() => {
    if (!sessionId) return;
    const stored = getStoredMessages(sessionId);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    }
  }, [sessionId, user, getStoredMessages]);

  useEffect(() => {
    if (sessionId) {
      storeMessages(sessionId, messages);
    }
  }, [messages, sessionId, storeMessages]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    let timeoutId = null;
    if (openMenuChatId && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setOpenMenuChatId(null);
        }
      }
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [openMenuChatId]);

  useEffect(() => {
    let timeoutId = null;
    if (showChatList && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setShowChatList(false);
        }
      }
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showChatList]);

  useEffect(() => {
    if (showProfileMenu) {
      function handleClickOutsideProfile(e) {
        const menuEl = document.getElementById("profile-menu-dropdown");
        if (menuEl && !safeContains(menuEl, e.target)) {
          setShowProfileMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutsideProfile);
      return () => document.removeEventListener("mousedown", handleClickOutsideProfile);
    }
  }, [showProfileMenu]);

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

  useEffect(() => {
    let timeoutId = null;
    if (showPopup) {
      function checkAndAddListener() {
        if (popupRef.current) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          timeoutId = setTimeout(checkAndAddListener, 50);
        }
      }
      checkAndAddListener();
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
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
    console.log("Iniciando renomeação para chatId:", chatId);
    setRenamingChatId(chatId);
    setPopupType("rename");
    setPopupMessage("Qual o nome deseja dar ao Chat?");
    setPopupInput("");
    setShowPopup(true);
  }

  function confirmRename() {
    console.log("Confirmando renomeação para chatId:", renamingChatId);
    
    if (renamingChatId && popupInput && popupInput.trim()) {
      const newName = popupInput.trim();
      console.log("Novo nome:", newName);
      
      // Criar nova lista com o nome atualizado
      const updatedList = chatList.map(chat => 
        chat.id === renamingChatId ? {...chat, name: newName} : chat
      );
      
      console.log("Lista atualizada:", updatedList);
      
      // Salvar no localStorage primeiro
      try {
        localStorage.setItem(
          `chatList_${user?.sub || user?.email || "default"}`,
          JSON.stringify(updatedList)
        );
        console.log("Salvo no localStorage");
      } catch (err) {
        console.error("Erro ao salvar no localStorage:", err);
      }
      
      // Atualizar o estado
      setChatList(updatedList);
      console.log("Estado atualizado");
    }
    
    // Limpar
    setRenamingChatId(null);
    setShowPopup(false);
    setPopupInput("");
    setOpenMenuChatId(null);
  }

  function handleDeleteChat(chatId) {
    setDeletingChatId(chatId);
    setPopupType("delete");
    setPopupMessage("Deseja realmente excluir este chat?");
    setShowPopup(true);
  }
  
  function confirmDelete() {
    if (deletingChatId) {
      setChatList((prev) => prev.filter((chat) => chat.id !== deletingChatId));
      removeMessagesForChatId(deletingChatId);
      
      if (sessionId === deletingChatId) {
        setSessionId(null);
        setMessages([]);
      }
    }
    
    setDeletingChatId(null);
    setShowPopup(false);
    setOpenMenuChatId(null);
  }

  function handleLogout() {
    setPopupType("logout");
    setPopupMessage("Deseja realmente sair?");
    setShowPopup(true);
  }
  
  function confirmLogout() {
    logout({ returnTo: window.location.origin });
    setShowPopup(false);
  }

  function handleEmailButton() {
    if (!isThinking) {
      setPopupType("email");
      setPopupMessage("Deseja receber a versão final?");
      setShowPopup(true);
    }
  }
  
  function confirmEmail() {
    handleSendMessage("Me apresente o planejamento, na versão final para cliente.");
    setShowPopup(false);
  }

  async function handleSendMessage(customMsg) {
    if (isThinking) return;
    
    // Se customMsg for null, isso significa que estamos apenas iniciando uma nova sessão sem enviar mensagem
    if (customMsg === null) return;

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
      // Escolher o endpoint baseado no modo selecionado
      const endpoint = useAV ? "http://localhost:4000/api/thewayiaav" : "http://localhost:4000/api/agent";
      
      console.log(`Enviando requisição para ${endpoint} (modo AV: ${useAV ? "ativado" : "desativado"})`);
      
      const response = await fetch(endpoint, {
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
      console.error(`Erro ao chamar ${useAV ? '/api/thewayiaav' : '/api/agent'}:`, err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro ao obter a resposta." }
      ]);
    } finally {
      setIsThinking(false);
      setShowThinking(false);
    }
  }

  // O estado hasUserMessage geralmente determina se devemos mostrar os botões iniciais
  const hasUserMessage = messages.some((m) => m.role === "user");
  // Se não há mensagens de usuário e não estamos forçando mostrar o chat, exibimos os botões
  const showInitialButtons = !hasUserMessage && !forceShowChat;
  
  // Para debug - resetar para tela inicial
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Shift+Escape para reset (para debug)
      if (e.key === 'Escape' && e.shiftKey) {
        resetToButtons();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Função para lidar com o clique no botão de planejamento financeiro
  function handlePlanningButtonClick(text, isAVMode = false) {
    console.log(`Botão clicado: ${isAVMode ? "AV" : "Planejamento"}`);
    
    // Definir modo API (TheWay-IA AV ou normal)
    setUseAV(isAVMode);
    
    // Forçar a transição para a interface de chat
    setForceShowChat(true);
    
    // Criar uma nova sessão para o chat
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);
    
    // Adicionar novo chat na lista
    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName };
    setChatList((prev) => {
      const updatedList = [...prev, newChat];
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
    
    // Para o modo AV, não enviamos mensagem, apenas mantemos a mensagem de boas-vindas
    if (isAVMode) {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
      return;
    }
    
    // Para modo planejamento, enviamos a mensagem padrão
    if (text) {
      handleSendMessage(text);
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !isThinking) {
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

  function toggleDarkMode() {
    setIsDarkMode((prev) => !prev);
  }

  function toggleMenu(chatId, e) {
    e.stopPropagation();
    setOpenMenuChatId((prev) => (prev === chatId ? null : chatId));
  }

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }

  // Função para resetar a interface para os botões iniciais (para debug se necessário)
  function resetToButtons() {
    console.log("Resetando para tela inicial");
    setForceShowChat(false);
    setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    // Limpar as mensagens armazenadas
    if (sessionId) {
      const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
      if (raw) {
        const parsed = JSON.parse(raw);
        parsed[sessionId] = [{ role: "assistant", content: getInitialMessage(user) }];
        localStorage.setItem(`messagesBySession_${user?.sub || user?.email || "default"}`, JSON.stringify(parsed));
      }
    }
  }

  // Função para lidar com o cancelamento de popups
  function handlePopupCancel() {
    setShowPopup(false);
    setPopupInput("");
    setRenamingChatId(null);
    setDeletingChatId(null);
  }

  // Função para lidar com a confirmação de popups
  function handlePopupConfirm() {
    if (popupType === "rename") {
      confirmRename();
    } else if (popupType === "delete") {
      confirmDelete();
    } else if (popupType === "logout") {
      confirmLogout();
    } else if (popupType === "email") {
      confirmEmail();
    }
  }

  // Estilos para centralizar o conteúdo
  const mainContainerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 200px)" // Ajuste conforme necessário
  };

  return (
    <div className={`container ${isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Cabeçalho */}
      <ChatHeader
        Logo={Logo}
        showChatList={showChatList}
        setShowChatList={setShowChatList}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
        showProfileMenu={showProfileMenu}
        setShowProfileMenu={setShowProfileMenu}
        user={user}
        isAuthenticated={isAuthenticated}
        handleLogout={handleLogout}
        getUserInitial={getUserInitial}
      />

      {/* Lista de Chats */}
      {showChatList && (
        <ChatList
          chatList={chatList}
          handleSelectChat={handleSelectChat}
          openMenuChatId={openMenuChatId}
          toggleMenu={toggleMenu}
          handleRenameChat={handleRenameChat}
          handleDeleteChat={handleDeleteChat}
          isDarkMode={isDarkMode}
          createNewSession={createNewSession}
          chatListPanelRef={chatListPanelRef}
        />
      )}

      {/* Área principal - mostra os botões iniciais ou as mensagens */}
      <div className="main" style={showInitialButtons ? mainContainerStyle : {}}>
        {showInitialButtons ? (
          <>
            <div style={{ textAlign: "center", marginBottom: "30px", fontSize: "18px" }}>
              {getInitialMessage(user)}
            </div>
            <InitialButtons
              onPlanningClick={handlePlanningButtonClick}
              onAVClick={handlePlanningButtonClick}
            />
          </>
        ) : (
          <>
            <MessageFeed
              messages={messages}
              showThinking={showThinking}
              thinkingPhrases={thinkingPhrases}
              phraseIndex={phraseIndex}
              messagesContainerRef={messagesContainerRef}
              showScrollToBottom={showScrollToBottom}
              scrollToBottom={scrollToBottom}
              isDarkMode={isDarkMode}
            />
            <div className="bottom-input">
              <MessageInput
                inputValue={inputValue}
                setInputValue={setInputValue}
                handleInput={handleInput}
                handleKeyDown={handleKeyDown}
                handleSendMessage={handleSendMessage}
                handleEmailButton={handleEmailButton}
                isThinking={isThinking}
                textareaRef={textareaRef}
                isDarkMode={isDarkMode}
              />
            </div>
          </>
        )}
      </div>

      {/* Popup para confirmações */}
      <Popup
        showPopup={showPopup}
        popupMessage={popupMessage}
        popupType={popupType}
        popupInput={popupInput}
        setPopupInput={setPopupInput}
        handleCancel={handlePopupCancel}
        handleConfirm={handlePopupConfirm}
        popupRef={popupRef}
      />

      <div className="footer-text" style={{ fontFamily: '"Montserrat", sans-serif', fontSize: "0.6rem" }}>
        Powered By Alta Vista Investimentos - V1.2.7
      </div>
    </div>
  );
}

export default ChatApp;