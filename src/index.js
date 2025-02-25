// src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import { Auth0Provider } from "@auth0/auth0-react";
import App from "./App.js";
import "./index.css";

// Substitua pelos valores do seu app no Painel da Auth0:
const domain = "altavista.us.auth0.com";    // Ex: "meu-tenant.us.auth0.com"
const clientId = "G2210oBgOBElx3xNhosej3iUhaIYCGaK";          // Copie do seu app no Auth0

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      redirectUri={window.location.origin}
    >
      <App />
    </Auth0Provider>
  </React.StrictMode>
);
