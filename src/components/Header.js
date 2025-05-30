import React from "react";
import { FaBars, FaMoon, FaSun, FaSignOutAlt, FaChartLine, FaHubspot, FaDollarSign, FaRobot } from "react-icons/fa";
import Logo from "../assets/logo.svg";

function Header({ 
  isDarkMode, 
  toggleDarkMode, 
  showChatList, 
  setShowChatList, 
  showProfileMenu,
  setShowProfileMenu,
  user,
  isAuthenticated,
  handleLogout,
  onOpenAIManagement
}) {
  const getUserInitial = (user) => {
    if (!user) return "z";
    const name = user.name || user.nickname || user.email || "z";
    return name.charAt(0).toUpperCase();
  };

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
          className="icon-button"
          aria-label="Abrir menu de chats"
        >
          <FaBars />
        </button>
        <button
          onClick={toggleDarkMode}
          className="icon-button"
          aria-label={isDarkMode ? "Ativar modo claro" : "Ativar modo escuro"}
        >
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>
        <div className="profile-container">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="profile-button"
            aria-label={isAuthenticated ? `Perfil de ${user.name || "usuário"}` : "Perfil"}
            aria-expanded={showProfileMenu}
          >
            {isAuthenticated ? getUserInitial(user) : "z"}
          </button>
          {showProfileMenu && (
            <div id="profile-menu-dropdown" className="profile-menu">
            <ul className="profile-menu-list">
            <li className="profile-menu-item">
            <FaDollarSign /> AV Comissões
            </li>
            <li className="profile-menu-item">
            <FaChartLine /> TradeInsights
            </li>
            <li className="profile-menu-item">
            <FaHubspot /> HubSpot
            </li>
            <li className="profile-menu-item" onClick={onOpenAIManagement}>
            <FaRobot /> Gestão de IA
            </li>
              <li className="profile-menu-item logout" onClick={handleLogout}>
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

export default Header;
