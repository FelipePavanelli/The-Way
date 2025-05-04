import React from 'react';

// Componente de cabeçalho inspirado no The-Way
const Header = ({ 
  logo, 
  toggleChatList, 
  showChatList, 
  createNewSession, 
  toggleDarkMode, 
  isDarkMode, 
  toggleProfileMenu, 
  showProfileMenu, 
  user, 
  getUserInitial 
}) => {
  return (
    <header className="w-full py-3 animate-fade-in border-b border-border/50 shadow-sm">
      <div className="container mx-auto flex justify-between items-center px-4">
        <div className="flex items-center gap-4">
          <img 
            src={logo} 
            alt="Logo" 
            className="h-8 w-auto object-contain"
          />
          <div>
            <h1 className="text-xl font-semibold tracking-tight">The Way - Alta Vista Investimentos</h1>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Botão para listar chats */}
          <button
            onClick={() => toggleChatList(!showChatList)}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Lista de chats"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z"></path>
            </svg>
          </button>
          
          {/* Botão para criar novo chat */}
          <button
            onClick={createNewSession}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Novo chat"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14"></path>
              <path d="M12 5v14"></path>
            </svg>
          </button>
          
          {/* Botão para alternar tema */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary hover:bg-secondary/80 transition-colors"
            aria-label="Alternar tema"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4"></circle>
                <path d="M12 2v2"></path>
                <path d="M12 20v2"></path>
                <path d="M4.93 4.93l1.41 1.41"></path>
                <path d="M17.66 17.66l1.41 1.41"></path>
                <path d="M2 12h2"></path>
                <path d="M20 12h2"></path>
                <path d="M6.34 17.66l-1.41 1.41"></path>
                <path d="M19.07 4.93l-1.41 1.41"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            )}
          </button>
          
          {/* Botão de perfil do usuário */}
          <button
            onClick={() => toggleProfileMenu(!showProfileMenu)}
            className="p-1 rounded-full bg-accent/10 hover:bg-accent/20 transition-colors text-accent ml-1"
            aria-label="Menu de perfil"
          >
            <span className="w-6 h-6 flex items-center justify-center font-medium">
              {getUserInitial(user)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
