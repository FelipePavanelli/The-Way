import React from "react";
import { FaEllipsisV, FaPencilAlt, FaTrash } from "react-icons/fa";

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
    <div className="chat-list-panel" ref={chatListPanelRef}>
      <h3>Meus Chats</h3>
      <ul className="chat-list">
        {chatList.map((chat) => (
          <li key={chat.id} className="chat-list-item">
            <div className="chat-item" onClick={() => handleSelectChat(chat.id)}>
              <span className="chat-name">{chat.name}</span>
              <div className="chat-item-menu" onClick={(e) => toggleMenu(chat.id, e)}>
                <FaEllipsisV />
              </div>
              {openMenuChatId === chat.id && (
                <div className="chat-item-dropdown" onClick={(e) => e.stopPropagation()}>
                  <button className="dropdown-button" onClick={() => handleRenameChat(chat.id)}>
                    <FaPencilAlt style={{ color: isDarkMode ? "#fff" : "#333" }} /> Renomear
                  </button>
                  <button className="dropdown-button delete" onClick={() => handleDeleteChat(chat.id)}>
                    <FaTrash /> Excluir
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
