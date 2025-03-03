import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ChatApp from "./ChatApp"; // seu componente de chat
import Logo from "./assets/logo.svg";

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
        {/* Top Bar igual ao do ChatApp */}
        <div className="top-bar">
          <div className="top-bar-left">
            <img src={Logo} alt="logo" />
          </div>
          <div className="top-bar-center">
            <span className="the-way-label">The Way</span>
          </div>
          <div className="top-bar-right">
            {/* Se quiser algum botão ou espaço, coloque aqui */}
          </div>
        </div>

        {/* Conteúdo de loading */}
        <div className="loading-screen fade-in">
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Se chegou aqui, está autenticado => renderiza o ChatApp
  return <ChatApp />;
}

export default App;
