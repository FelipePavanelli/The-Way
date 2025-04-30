import React from 'react';
import { FaEllipsisV, FaPencilAlt, FaTrash } from 'react-icons/fa';

function ChatList({ 
  chatList, 
  handleSelectChat, 
  openMenuChatId, 
  toggleMenu, 
  handleRenameChat, 
  handleDeleteChat, 
  isDarkMode, 
  createNewSession,
  chatListPanelRef 
}) {
  return (
    <div className="chat-list-panel" ref={chatListPanelRef} style={{
      maxHeight: "70vh",
      overflowY: "auto"
    }}>
      <h3>Meus Chats</h3>
      <ul>
        {chatList.map((chat) => (
          <li key={chat.id}>
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
  );
}

export default ChatList;