import { useState, useEffect } from 'react';

/**
 * Hook para gerenciar o tema da aplicação (claro/escuro)
 * @returns {Object} { isDarkMode, toggleDarkMode }
 */
export function useTheme() {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Verificar tema salvo no localStorage, mas sempre iniciar com o tema claro
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    // Ignorar preferência do sistema e iniciar sempre com tema claro
    return false;
  });

  // Efeito para atualizar a classe dark no documento e salvar a preferência
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Função para alternar o tema
  const toggleDarkMode = () => {
    setIsDarkMode(prev => !prev);
  };

  return { isDarkMode, toggleDarkMode };
}
