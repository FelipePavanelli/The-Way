// src/App.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ChatApp from "./ChatApp";


function App() {
  const { isLoading, logout } = useAuth0();
  // Para desenvolvimento, desativamos o redirecionamento para login.
  // Você pode comentar ou remover as linhas que forçam o login.
  // Exemplo:
  // const { isLoading, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  // if (!isAuthenticated) {
  //   loginWithRedirect();
  //   return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Redirecionando...</div>;
  // }

  if (isLoading) {
    return <div style={{ color: "#fff", textAlign: "center", marginTop: "2rem" }}>Carregando...</div>;
  }

  return (
    <div>
      {/* Botão de Logout (ainda disponível para testes, se necessário) */}
      <button
        onClick={() => logout({ returnTo: window.location.origin })}
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          padding: "0.5rem 1rem",
          background: "#dc3545",
          border: "none",
          borderRadius: "10px",
          color: "#fff",
          cursor: "pointer",
          zIndex: 999
        }}
      >
        Logout
      </button>

      {/* Como o login foi desativado para desenvolvimento, renderizamos o ChatApp diretamente */}
      <ChatApp />
    </div>
  );
}

export default App;
