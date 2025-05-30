import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ChatApp from "./ChatApp.js";
import Logo from "./assets/logo.svg";
import "./styles.css";

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado, redireciona para login
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  // Se ainda está carregando as credenciais do Auth0, exibe tela de loading
  if (isLoading) {
    return (
      <div className="container light-mode">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="top-bar-left">
            <img src={Logo} alt="logo" />
          </div>
          <div className="top-bar-center">
            <span className="the-way-label">The Way - Planejador Financeiro</span>
          </div>
          <div className="top-bar-right"></div>
        </div>

        {/* Conteúdo de loading */}
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p className="loading-text">Iniciando o The Way...</p>
        </div>
        
        <div className="footer-text">
          Powered By Alta Vista Investimentos - V1.2.0
        </div>
      </div>
    );
  }

  // Se chegou aqui, está autenticado => renderiza o ChatApp
  return <ChatApp />;
}

export default App;
