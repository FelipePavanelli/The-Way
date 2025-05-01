import React, { useRef, useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import Logo from "./assets/logo.svg";
import "./theway.css";

// Custom hooks
import { useTheme } from "./hooks/useTheme";
import { useChat } from "./hooks/useChat";

// Componentes
import Header from "./components/Header";
import ChatList from "./components/ChatList";
import MessageFeed from "./components/MessageFeed";
import InitialButtons from "./components/InitialButtons";
import MessageInput from "./components/MessageInput";
import Popup from "./components/Popup";

// Utilitários
import { safeContains, getUserInitial, thinkingPhrases } from "./utils/helpers";

function ChatApp() {
  const { user, isAuthenticated, logout } = useAuth0();
  const { isDarkMode, toggleDarkMode } = useTheme();
  
  // Estados de UI
  const [showChatList, setShowChatList] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupInput, setPopupInput] = useState("");
  const [popupType, setPopupType] = useState(""); // "rename", "delete", "email", "logout"
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  
  // Refs
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);
  const popupRef = useRef(null);
  
  // Hook de gerenciamento de chat
  const {
    chatList,
    sessionId,
    messages,
    isThinking,
    showThinking,
    phraseIndex,
    setPhraseIndex,
    inputValue,
    setInputValue,
    openMenuChatId,
    setOpenMenuChatId,
    showInitialButtons,
    createNewSession,
    handleSelectChat,
    handleRenameChat,
    handleDeleteChat,
    handleSendMessage,
    handlePlanningButtonClick
  } = useChat(user);
  
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
  }, [showThinking, setPhraseIndex]);
  
  // Efeito para rolagem automática
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);
  
  // Efeito para detectar cliques fora dos menus
  useEffect(() => {
    if (openMenuChatId && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setOpenMenuChatId(null);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [openMenuChatId]);

  useEffect(() => {
    if (showChatList && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setShowChatList(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
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
  
  // Efeito para detectar rolagem da mensagem
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
  
  // Efeito para detectar clique fora do popup
  useEffect(() => {
    if (showPopup) {
      function handleClickOutside(e) {
        if (popupRef.current && !safeContains(popupRef.current, e.target)) {
          setShowPopup(false);
          setPopupInput("");
          setRenamingChatId(null);
          setDeletingChatId(null);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showPopup]);
  
  // Funções para manipulação de UI
  function toggleMenu(chatId, e) {
    e.stopPropagation();
    setOpenMenuChatId((prev) => (prev === chatId ? null : chatId));
  }

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }
  
  function showRenamePopup(chatId) {
    setRenamingChatId(chatId);
    setPopupType("rename");
    setPopupMessage("Qual o nome deseja dar ao Chat?");
    setPopupInput("");
    setShowPopup(true);
  }

  function showDeletePopup(chatId) {
    setDeletingChatId(chatId);
    setPopupType("delete");
    setPopupMessage("Deseja realmente excluir este chat?");
    setShowPopup(true);
  }

  function showLogoutPopup() {
    setPopupType("logout");
    setPopupMessage("Deseja realmente sair?");
    setShowPopup(true);
  }

  function showEmailPopup() {
    if (!isThinking) {
      setPopupType("email");
      setPopupMessage("Deseja receber a versão final?");
      setShowPopup(true);
    }
  }
  
  // Funções para confirmar ações dos popups
  function handlePopupCancel() {
    setShowPopup(false);
    setPopupInput("");
    setRenamingChatId(null);
    setDeletingChatId(null);
  }
  
  function handlePopupConfirm() {
    if (popupType === "rename") {
      handleRenameChat(renamingChatId, popupInput);
      setRenamingChatId(null);
    } else if (popupType === "delete") {
      handleDeleteChat(deletingChatId);
      setDeletingChatId(null);
    } else if (popupType === "logout") {
      logout({ returnTo: window.location.origin });
    } else if (popupType === "email") {
      handleSendMessage("Me apresente o planejamento, na versão final para cliente.");
    }
    
    setShowPopup(false);
    setPopupInput("");
    setOpenMenuChatId(null);
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
  
  // Renderização do componente  
  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''} bg-background text-foreground`}>
      {/* Cabeçalho */}
      <Header 
        logo={Logo}
        toggleChatList={setShowChatList}
        showChatList={showChatList}
        createNewSession={createNewSession}
        toggleDarkMode={toggleDarkMode}
        isDarkMode={isDarkMode}
        toggleProfileMenu={setShowProfileMenu}
        showProfileMenu={showProfileMenu}
        user={user}
        getUserInitial={getUserInitial}
      />
      
      {/* Menu de perfil */}
      {showProfileMenu && (
        <div id="profile-menu-dropdown" className="absolute right-4 top-16 z-50 bg-card shadow-lg rounded-lg border border-border overflow-hidden w-48">
          <div className="p-3 border-b border-border/50">
            <p className="text-sm font-medium truncate">{user?.name || user?.nickname || user?.email || "Usuário"}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email || ""}</p>
          </div>
          <div className="p-2">
            <button 
              onClick={showLogoutPopup}
              className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/80 rounded-md transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      )}
      
      {/* Lista de chats */}
      {showChatList && (
        <ChatList
          chatList={chatList}
          handleSelectChat={handleSelectChat}
          sessionId={sessionId}
          openMenuChatId={openMenuChatId}
          toggleMenu={toggleMenu}
          handleRenameChat={showRenamePopup}
          handleDeleteChat={showDeletePopup}
          createNewSession={createNewSession}
          chatListPanelRef={chatListPanelRef}
        />
      )}
      
      {/* Área principal */}
      <main className="flex-1 container mx-auto px-4 flex flex-col">
        {showInitialButtons ? (
          /* Tela inicial com botões */
          <div className="flex-1 flex flex-col items-center justify-center py-10">
            <div className="text-center mb-8 animate-fade-in">
              <h2 className="text-xl font-medium mb-2">Como posso te ajudar hoje?</h2>
              <p className="text-muted-foreground">Selecione uma opção para começar:</p>
            </div>
            
            <InitialButtons
              onPlanningClick={handlePlanningButtonClick}
              onAVClick={handlePlanningButtonClick}
            />
          </div>
        ) : (
          /* Interface de chat */
          <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full py-4">
            <MessageFeed
              messages={messages}
              showThinking={showThinking}
              thinkingPhrases={thinkingPhrases}
              phraseIndex={phraseIndex}
              messagesContainerRef={messagesContainerRef}
              showScrollToBottom={showScrollToBottom}
              scrollToBottom={scrollToBottom}
            />
            
            <MessageInput
              inputValue={inputValue}
              setInputValue={setInputValue}
              handleInput={handleInput}
              handleKeyDown={handleKeyDown}
              handleSendMessage={handleSendMessage}
              handleEmailButton={showEmailPopup}
              isThinking={isThinking}
              textareaRef={textareaRef}
            />
          </div>
        )}
      </main>

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

      {/* Rodapé */}
      <footer className="py-4 text-center text-xs text-muted-foreground">
        Powered By Alta Vista Investimentos - V1.3.0
      </footer>
    </div>
  );
}

export default ChatApp;