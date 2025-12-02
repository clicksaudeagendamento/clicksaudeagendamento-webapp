import { Navigate } from 'react-router-dom';
import { ReactNode, useEffect, useState } from 'react';

interface ProtectedWelcomeRouteProps {
  children: ReactNode;
}

/**
 * Componente que protege a rota /boas-vindas
 * Só permite acesso se o usuário acabou de realizar um cadastro
 * Verifica através do sessionStorage se há uma flag de registro recente
 */
export const ProtectedWelcomeRoute = ({ children }: ProtectedWelcomeRouteProps) => {
  const [isAllowed, setIsAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    // Verifica se existe a flag de registro recente no sessionStorage
    const hasJustRegistered = sessionStorage.getItem('justRegistered') === 'true';
    setIsAllowed(hasJustRegistered);
  }, []);

  // Enquanto verifica, não renderiza nada (ou poderia renderizar um loading)
  if (isAllowed === null) {
    return null;
  }

  // Se não tem permissão, redireciona para a home
  if (!isAllowed) {
    return <Navigate to="/" replace />;
  }

  // Se tem permissão, renderiza o componente filho
  return <>{children}</>;
};
