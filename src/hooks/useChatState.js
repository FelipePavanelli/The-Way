import React, { useState, useEffect, useRef, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";

// Importar marked para renderização de markdown
const marked = window.marked || {};
if (!window.marked) {
  console.warn("Marked library not found globally, markdown rendering might not work properly.");
}

// Hook para gerenciar o estado e lógica do chat
export const useChatState = () => {
  const { user, isAuthenticated, logout } = useAuth0();

  // Estado para UI
  const [showChatList, setShowChatList] = useState(false);
  const [openMenuChatId, setOpenMenuChatId] = useState(null);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);

  // Estado para chats
  const [chatList, setChatList] = useState(() => {
    const stored = localStorage.getItem(`chatList_${user?.sub || user?.email || "default"}`);
    const parsed = stored ? JSON.parse(stored) : [];
    const uniqueChats = Array.from(new Map(parsed.map(item => [item.id, item])).values());
    return uniqueChats;
  });
  
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromURL = urlParams.get("chatId");
    const storedSessionId = localStorage.getItem(`sessionId_${user?.sub || user?.email || "default"}`) || null;
    return chatIdFromURL || storedSessionId;
  });

  // Estado para mensagens
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  
  // Estado para o popup
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [popupInput, setPopupInput] = useState("");
  const [popupType, setPopupType] = useState(""); // "rename", "delete", "email", "logout"
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [deletingChatId, setDeletingChatId] = useState(null);
  
  // Estado para frases de pensamento
  const [phraseIndex, setPhraseIndex] = useState(0);
  const thinkingPhrases = [
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "...",
    "..."
  ];

  // Refs
  const textareaRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const chatListPanelRef = useRef(null);
  const popupRef = useRef(null);

  // URL base da API
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:4000";

  // Persistência de dark mode
  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  // Efeito para alternar as frases de pensamento
  useEffect(() => {
    let interval;
    if (showThinking) {
      interval = setInterval(() => {
        setPhraseIndex((prevIndex) => (prevIndex + 1) % thinkingPhrases.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [showThinking, thinkingPhrases.length]);

  // Funções para gerenciar armazenamento local
  const getStoredMessages = useCallback((sid) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return parsed[sid] || [];
  }, [user]);

  const storeMessages = useCallback((sid, msgs) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    const parsed = raw ? JSON.parse(raw) : {};
    parsed[sid] = msgs;
    localStorage.setItem(`messagesBySession_${user?.sub || user?.email || "default"}`, JSON.stringify(parsed));
  }, [user]);

  const removeMessagesForChatId = useCallback((chatId) => {
    const raw = localStorage.getItem(`messagesBySession_${user?.sub || user?.email || "default"}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    delete parsed[chatId];
    localStorage.setItem(`messagesBySession_${user?.sub || user?.email || "default"}`, JSON.stringify(parsed));
  }, [user]);

  // Funções para gerenciar sessões de chat
  const createNewSession = useCallback(() => {
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);

    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName };
    setChatList((prev) => {
      const updatedList = [...prev, newChat];
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
  }, [chatList, user]);

  const addChatToListIfMissing = useCallback((chatId) => {
    const exists = chatList.some((chat) => chat.id === chatId);
    if (!exists) {
      const newChatName = getUniqueChatName(chatList);
      const newChat = { id: chatId, name: newChatName };
      setChatList((prev) => {
        const updatedList = [...prev, newChat];
        return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
      });
    }
  }, [chatList]);

  // Helpers para manipular a UI
  function getUniqueChatName(chatList) {
    let maxNumber = 0;
    chatList.forEach((chat) => {
      const match = chat.name.match(/^Chat (\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    return `Chat ${maxNumber + 1}`;
  }

  function getInitialMessage(user) {
    if (user) {
      return `Como posso te ajudar hoje?`;
    }
    return "Como posso te ajudar hoje?";
  }

  function updateURLWithChatId(id) {
    const url = new URL(window.location.href);
    url.searchParams.set("chatId", id);
    window.history.replaceState({}, "", url.toString());
  }

  const handleClickOutside = useCallback((e) => {
    if (!safeContains(popupRef.current, e.target)) {
      setShowPopup(false);
      setPopupInput("");
      setRenamingChatId(null);
      setDeletingChatId(null);
    }
  }, []);

  function safeContains(element, target) {
    try {
      return element && typeof element.contains === 'function' && element.contains(target);
    } catch (error) {
      console.error("Erro ao verificar contains:", error);
      return false;
    }
  }

  // Efeitos para gerenciar a sessão atual
  useEffect(() => {
    if (!sessionId) {
      if (chatList.length > 0) {
        const firstChatId = chatList[0].id;
        setSessionId(firstChatId);
        localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, firstChatId);
        updateURLWithChatId(firstChatId);
      } else {
        createNewSession();
      }
    } else {
      addChatToListIfMissing(sessionId);
      updateURLWithChatId(sessionId);
    }
  }, [sessionId, chatList, user, addChatToListIfMissing, createNewSession]);

  useEffect(() => {
    localStorage.setItem(`chatList_${user?.sub || user?.email || "default"}`, JSON.stringify(chatList));
  }, [chatList, user]);

  useEffect(() => {
    if (!sessionId) return;
    const stored = getStoredMessages(sessionId);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    }
  }, [sessionId, user, getStoredMessages]);

  useEffect(() => {
    if (sessionId) {
      storeMessages(sessionId, messages);
    }
  }, [messages, sessionId, storeMessages]);

  // Efeito para scroll automático para novas mensagens
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  // Efeito para detectar quando o usuário rola para cima
  useEffect(() => {
    const handleScroll = () => {
      const container = messagesContainerRef.current;
      if (container) {
        const isScrolledToBottom = container.scrollHeight - container.scrollTop <= container.clientHeight + 50;
        setShowScrollToBottom(!isScrolledToBottom);
      }
    };
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, []);

  // Efeitos para gerenciar menus de contexto
  useEffect(() => {
    let timeoutId = null;
    if (openMenuChatId && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setOpenMenuChatId(null);
        }
      }
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [openMenuChatId]);

  useEffect(() => {
    let timeoutId = null;
    if (showChatList && chatListPanelRef.current) {
      function handleClickOutside(e) {
        if (!safeContains(chatListPanelRef.current, e.target)) {
          setShowChatList(false);
        }
      }
      timeoutId = setTimeout(() => {
        document.addEventListener("mousedown", handleClickOutside);
      }, 0);
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showChatList]);

  useEffect(() => {
    if (showProfileMenu) {
      function handleClickOutsideProfile(e) {
        const menuEl = document.getElementById("profile-menu-dropdown");
        if (menuEl && !safeContains(menuEl, e.target)) {
          setShowProfileMenu(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutsideProfile);
      return () => document.removeEventListener("mousedown", handleClickOutsideProfile);
    }
  }, [showProfileMenu]);

  // Efeito para gerenciar popups
  useEffect(() => {
    let timeoutId = null;
    if (showPopup) {
      function checkAndAddListener() {
        if (popupRef.current) {
          document.addEventListener("mousedown", handleClickOutside);
        } else {
          timeoutId = setTimeout(checkAndAddListener, 50);
        }
      }
      checkAndAddListener();
      return () => {
        if (timeoutId) clearTimeout(timeoutId);
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showPopup, handleClickOutside]);

  // Handlers para ações de UI
  function handleSelectChat(chatId) {
    setSessionId(chatId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, chatId);
    updateURLWithChatId(chatId);
    setOpenMenuChatId(null);
    setShowChatList(false);
  }

  function handleRenameChat(chatId) {
    setRenamingChatId(chatId);
    setPopupType("rename");
    setPopupMessage("Qual o nome deseja dar ao Chat?");
    setPopupInput("");
    setShowPopup(true);
  }

  function confirmRename() {
    if (renamingChatId && popupInput && popupInput.trim()) {
      const newName = popupInput.trim();
      
      // Criar nova lista com o nome atualizado
      const updatedList = chatList.map(chat => 
        chat.id === renamingChatId ? {...chat, name: newName} : chat
      );
      
      // Salvar no localStorage primeiro
      try {
        localStorage.setItem(
          `chatList_${user?.sub || user?.email || "default"}`,
          JSON.stringify(updatedList)
        );
      } catch (err) {
        console.error("Erro ao salvar no localStorage:", err);
      }
      
      // Atualizar o estado
      setChatList(updatedList);
    }
    
    // Limpar
    setRenamingChatId(null);
    setShowPopup(false);
    setPopupInput("");
    setOpenMenuChatId(null);
  }

  function handleDeleteChat(chatId) {
    setDeletingChatId(chatId);
    setPopupType("delete");
    setPopupMessage("Deseja realmente excluir este chat?");
    setShowPopup(true);
  }
  
  function confirmDelete() {
    if (deletingChatId) {
      setChatList((prev) => prev.filter((chat) => chat.id !== deletingChatId));
      removeMessagesForChatId(deletingChatId);
      
      if (sessionId === deletingChatId) {
        setSessionId(null);
        setMessages([]);
      }
    }
    
    setDeletingChatId(null);
    setShowPopup(false);
    setOpenMenuChatId(null);
  }

  function handleLogout() {
    setPopupType("logout");
    setPopupMessage("Deseja realmente sair?");
    setShowPopup(true);
  }
  
  function confirmLogout() {
    logout({ returnTo: window.location.origin });
    setShowPopup(false);
  }

  function handleEmailButton() {
    if (!isThinking) {
      generateReport();
    }
  }
  
  async function generateReport() {
    try {
      // Preparar dados do histórico do chat
      const chatHistory = {
        sessionId: sessionId,
        user: user?.email || user?.name || 'Usuário',
        timestamp: new Date().toISOString(),
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content,
          timestamp: new Date().toISOString()
        }))
      };

      // Enviar para a API do n8n
      const response = await fetch('https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(chatHistory)
      });

      if (response.ok) {
        // Mostrar popup de sucesso com link
        setPopupType("success");
        setPopupMessage(`O relatório está sendo preparado e em até 2 minutos estará disponível no link: https://relatorio.theway.altavistainvest.com.br/?sessionId=${sessionId}`);
        setShowPopup(true);
      } else {
        throw new Error('Erro ao enviar relatório');
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      // Mostrar popup de erro
      setPopupType("error");
      setPopupMessage("Erro ao gerar relatório. Tente novamente.");
      setShowPopup(true);
    }
  }
  
  function confirmSuccess() {
    // Abrir o link do relatório em nova aba
    const reportUrl = `https://relatorio.theway.altavistainvest.com.br/?sessionId=${sessionId}`;
    window.open(reportUrl, '_blank');
    setShowPopup(false);
  }
  
  function confirmError() {
    setShowPopup(false);
  }

  function toggleMenu(chatId, e) {
    e.stopPropagation();
    setOpenMenuChatId((prev) => (prev === chatId ? null : chatId));
  }

  function toggleDarkMode() {
    setIsDarkMode((prev) => !prev);
  }

  function scrollToBottom() {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey && !isThinking) {
      e.preventDefault();
      handleSendMessage();
    }
  }

  function handleInput(e) {
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";
  }

  function resetTextarea() {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }

  // Função para enviar dados para o webhook do n8n
  async function sendToWebhook(userMessage, aiResponse) {
    try {
      const webhookData = {
        sessionId: sessionId,
        user: user?.email || user?.name || 'Usuário',
        timestamp: new Date().toISOString(),
        interaction: {
          human: userMessage,
          ai: aiResponse
        }
      };

      const response = await fetch('https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        console.warn('Falha ao enviar dados para webhook:', response.status);
      }
    } catch (error) {
      console.error('Erro ao enviar para webhook:', error);
    }
  }

  // API de comunicação
  async function handleSendMessage(customMsg = null) {
    if (isThinking) return;

    const textToSend = customMsg || inputValue.trim();
    if (!textToSend) return;

    if (!customMsg) {
      setInputValue("");
      resetTextarea();
    }

    // Adicionar mensagem do usuário ao histórico e UI
    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    
    // Atualizar histórico local para a API
    const messageHistory = [
      ...messages,
      { role: "user", content: textToSend }
    ];
    
    setIsThinking(true);
    setShowThinking(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/stream-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          messages: messageHistory
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      let decoder = new TextDecoder();
      let fullText = '';
      
      // Remover indicador de pensamento
      setShowThinking(false);
      
      // Criar elemento para mostrar a resposta (usando DOM diretamente para streaming)
      let assistantDiv = document.createElement('div');
      assistantDiv.className = 'message assistant-message';
      let markdownContent = document.createElement('div');
      markdownContent.className = 'markdown-content';
      assistantDiv.appendChild(markdownContent);
      
      // Adicionar temporariamente ao DOM para mostrar streaming
      messagesContainerRef.current.appendChild(assistantDiv);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        chunk.split('data: ').forEach(part => {
          if (part && part !== '[DONE]\n\n' && !part.startsWith('[ERROR]')) {
            fullText += part.replace('\n\n', '');
            markdownContent.innerHTML = marked.parse(fullText);
            assistantDiv.scrollIntoView({ behavior: 'smooth', block: 'end' });
          }
        });
      }

      // Remover o elemento temporário
      messagesContainerRef.current.removeChild(assistantDiv);
      
      // Adicionar a resposta completa do assistente ao histórico
      setMessages(prev => [...prev, { role: "assistant", content: fullText }]);

      // Enviar interação para o webhook do n8n
      await sendToWebhook(textToSend, fullText);

    } catch (error) {
      console.error('Error:', error);
      const errorMessage = "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.";
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage }
      ]);
      
      // Enviar erro para o webhook também
      await sendToWebhook(textToSend, errorMessage);
    } finally {
      setIsThinking(false);
      setShowThinking(false);
    }
  }

  function handlePlanningButtonClick(text) {
    handleSendMessage(text);
  }

  // Determinar se deve mostrar os botões iniciais
  const hasUserMessage = messages.some((m) => m.role === "user");
  const showInitialButtons = !hasUserMessage;

  return {
    // Estado
    showChatList,
    setShowChatList,
    openMenuChatId,
    showProfileMenu,
    setShowProfileMenu,
    chatList,
    isDarkMode,
    sessionId,
    messages,
    inputValue,
    setInputValue,
    isThinking,
    showThinking,
    showPopup,
    popupMessage,
    popupInput,
    setPopupInput,
    popupType,
    renamingChatId,
    setRenamingChatId,
    deletingChatId,
    setDeletingChatId,
    phraseIndex,
    thinkingPhrases,
    showScrollToBottom,
    showInitialButtons,
    
    // Refs
    textareaRef,
    messagesContainerRef,
    chatListPanelRef,
    popupRef,
    
    // Auth
    user,
    isAuthenticated,
    logout,
    
    // Handlers
    handleSelectChat,
    handleRenameChat,
    confirmRename,
    handleDeleteChat,
    confirmDelete,
    handleLogout,
    confirmLogout,
    handleEmailButton,
    confirmSuccess,
    confirmError,
    toggleMenu,
    toggleDarkMode,
    scrollToBottom,
    handleKeyDown,
    handleInput,
    handleSendMessage,
    handlePlanningButtonClick,
    createNewSession
  };
};

export default useChatState;
