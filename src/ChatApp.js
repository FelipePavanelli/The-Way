import React, { useState } from "react";
import Header from "./components/Header";
import ChatList from "./components/ChatList";
import MessageFeed from "./components/MessageFeed";
import InputArea from "./components/InputArea";
import Popup from "./components/Popup";
import AIManagement from "./components/Admin/AIManagement";
import useChatState from "./hooks/useChatState";
import "./styles.css";

function ChatApp() {
  const chatState = useChatState();
  const [showAIManagement, setShowAIManagement] = useState(false);
  
  const handleOpenAIManagement = () => {
    setShowAIManagement(true);
    chatState.setShowProfileMenu(false);
  };

  const handleCloseAIManagement = () => {
    setShowAIManagement(false);
  };
  
  return (
    <div className={`container ${chatState.isDarkMode ? "dark-mode" : "light-mode"}`}>
      {/* Header com logo e controles */}
      <Header 
        isDarkMode={chatState.isDarkMode}
        toggleDarkMode={chatState.toggleDarkMode}
        showChatList={chatState.showChatList}
        setShowChatList={chatState.setShowChatList}
        showProfileMenu={chatState.showProfileMenu}
        setShowProfileMenu={chatState.setShowProfileMenu}
        user={chatState.user}
        isAuthenticated={chatState.isAuthenticated}
        handleLogout={chatState.handleLogout}
        onOpenAIManagement={handleOpenAIManagement}
      />

      {/* Painel de chats (visível apenas quando necessário) */}
      {chatState.showChatList && (
        <ChatList 
          chatList={chatState.chatList}
          handleSelectChat={chatState.handleSelectChat}
          openMenuChatId={chatState.openMenuChatId}
          toggleMenu={chatState.toggleMenu}
          handleRenameChat={chatState.handleRenameChat}
          handleDeleteChat={chatState.handleDeleteChat}
          isDarkMode={chatState.isDarkMode}
          createNewSession={chatState.createNewSession}
          chatListPanelRef={chatState.chatListPanelRef}
        />
      )}

      {/* Área de mensagens */}
      <MessageFeed 
        messages={chatState.messages}
        showThinking={chatState.showThinking}
        thinkingPhrases={chatState.thinkingPhrases}
        phraseIndex={chatState.phraseIndex}
        messagesContainerRef={chatState.messagesContainerRef}
        showScrollToBottom={chatState.showScrollToBottom}
        scrollToBottom={chatState.scrollToBottom}
        isDarkMode={chatState.isDarkMode}
      />

      {/* Área de entrada de mensagens */}
      <InputArea 
        showInitialButtons={chatState.showInitialButtons}
        handlePlanningButtonClick={chatState.handlePlanningButtonClick}
        textareaRef={chatState.textareaRef}
        inputValue={chatState.inputValue}
        setInputValue={chatState.setInputValue}
        handleKeyDown={chatState.handleKeyDown}
        handleInput={chatState.handleInput}
        handleEmailButton={chatState.handleEmailButton}
        isThinking={chatState.isThinking}
        handleSendMessage={chatState.handleSendMessage}
        isDarkMode={chatState.isDarkMode}
      />

      {/* Popup para ações como renomear, excluir, etc. */}
      <Popup 
        showPopup={chatState.showPopup}
        setShowPopup={chatState.setShowPopup}
        popupMessage={chatState.popupMessage}
        popupInput={chatState.popupInput}
        setPopupInput={chatState.setPopupInput}
        popupType={chatState.popupType}
        confirmRename={chatState.confirmRename}
        confirmDelete={chatState.confirmDelete}
        confirmLogout={chatState.confirmLogout}
        confirmSuccess={chatState.confirmSuccess}
        confirmError={chatState.confirmError}
        setRenamingChatId={chatState.setRenamingChatId}
        setDeletingChatId={chatState.setDeletingChatId}
        popupRef={chatState.popupRef}
      />

      <div className="footer-text">
        Powered By Alta Vista Investimentos - V1.2.0
      </div>

      {/* Painel de Gestão de IA */}
      {showAIManagement && (
        <>
          <div className="admin-overlay" onClick={handleCloseAIManagement}></div>
          <AIManagement 
            onClose={handleCloseAIManagement}
            isDarkMode={chatState.isDarkMode}
          />
        </>
      )}
    </div>
  );
}

export default ChatApp;
