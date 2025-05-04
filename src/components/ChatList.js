import React from 'react';

const ChatList = ({ 
  chatList, 
  handleSelectChat, 
  sessionId, 
  openMenuChatId, 
  toggleMenu, 
  handleRenameChat, 
  handleDeleteChat, 
  createNewSession,
  chatListPanelRef 
}) => {
  return (
    <div 
      ref={chatListPanelRef}
      className="animate-in slide-in-from-top duration-300 absolute top-20 right-4 z-50 w-64 bg-card rounded-lg border border-border shadow-lg overflow-hidden"
    >
      <div className="p-3">
        <h3 className="text-sm font-medium mb-2">Conversas</h3>
        <ul className="space-y-1 max-h-[400px] overflow-y-auto pr-1 no-scrollbar">
          {chatList.map((chat) => (
            <li key={chat.id}>
              <div 
                className={`flex items-center justify-between px-3 py-2 rounded-md text-sm cursor-pointer ${
                  sessionId === chat.id ? 'bg-accent/10 text-accent' : 'hover:bg-secondary/80'
                }`}
                onClick={() => handleSelectChat(chat.id)}
              >
                <span className="truncate">{chat.name}</span>
                <button 
                  className="p-1 rounded-md hover:bg-secondary transition-colors"
                  onClick={(e) => toggleMenu(chat.id, e)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="1"></circle>
                    <circle cx="19" cy="12" r="1"></circle>
                    <circle cx="5" cy="12" r="1"></circle>
                  </svg>
                </button>
                
                {/* Menu de opções para o chat */}
                {openMenuChatId === chat.id && (
                  <div className="absolute right-12 mt-0 bg-card rounded-md shadow-lg border border-border overflow-hidden w-40 z-50">
                    <button 
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2"
                      onClick={() => handleRenameChat(chat.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"></path>
                      </svg>
                      Renomear
                    </button>
                    <button 
                      className="w-full text-left px-3 py-2 text-sm hover:bg-secondary/80 flex items-center gap-2 text-destructive"
                      onClick={() => handleDeleteChat(chat.id)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                      Excluir
                    </button>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <button 
          className="w-full mt-3 py-2 bg-accent text-accent-foreground rounded-md text-sm font-medium transition-colors hover:bg-accent/90"
          onClick={createNewSession}
        >
          Nova conversa
        </button>
      </div>
    </div>
  );
};

export default ChatList;
