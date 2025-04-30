import React from 'react';
import { FaBars, FaMoon, FaSun, FaSignOutAlt, FaDollarSign, FaChartLine, FaHubspot } from 'react-icons/fa';

function ChatHeader({ 
  Logo, 
  showChatList, 
  setShowChatList, 
  isDarkMode, 
  toggleDarkMode,
  showProfileMenu,
  setShowProfileMenu,
  user,
  isAuthenticated,
  handleLogout,
  getUserInitial
}) {
  return (
    <div className="top-bar">
      <div className="top-bar-left">
        <img src={Logo} alt="logo" />
      </div>
      <div className="top-bar-center">
        <span className="the-way-label">The Way - Planejador Financeiro</span>
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
  );
}

export default ChatHeader;