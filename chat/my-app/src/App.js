// src/App.js
import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import ChatApp from "./ChatApp.js";

function App() {
  const { isLoading } = useAuth0();

  if (isLoading) {
    return <div style={{ color: "#000", textAlign: "center", marginTop: "2rem" }}>Carregando...</div>;
  }

  // Simplesmente renderizamos o ChatApp
  return (
    <div style={{ position: "relative" }}>
      <ChatApp />
    </div>
  );
}

export default App;
