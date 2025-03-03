import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";

function PrivateRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth0();

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  // Se não estiver autenticado, redireciona para "/"
  return isAuthenticated ? children : <Navigate to="/" replace />;
}

export default PrivateRoute;
