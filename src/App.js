import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ChatApp from "./ChatApp"; // Este é o seu componente de chat

function App() {
  const { isLoading, isAuthenticated, loginWithRedirect } = useAuth0();

  useEffect(() => {
    // Se não estiver carregando e não estiver autenticado,
    // faz login imediatamente
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se chegou aqui, significa que está autenticado
  return <ChatApp />;
}

export default App;
