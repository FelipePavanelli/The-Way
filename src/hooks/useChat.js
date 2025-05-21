import { useState, useEffect, useCallback } from 'react';
import { 
  getUniqueChatName, 
  getInitialMessage, 
  updateURLWithChatId,
  getStoredMessages,
  storeMessages,
  removeMessagesForChatId
} from '../utils/helpers';

/**
 * Hook para gerenciar a funcionalidade de chat
 * @param {Object} user - Objeto do usuário autenticado
 * @returns {Object} - Estados e funções do chat
 */
export function useChat(user) {
  // Lista de chats - ordenados do mais recente para o mais antigo
  const [chatList, setChatList] = useState(() => {
    const stored = localStorage.getItem(`chatList_${user?.sub || user?.email || "default"}`);
    const parsed = stored ? JSON.parse(stored) : [];
    const uniqueChats = Array.from(new Map(parsed.map(item => [item.id, item])).values());
    // Adicionar uma propriedade timestamp se não existir e ordenar pelo timestamp (mais recente primeiro)
    const chatsWithTimestamp = uniqueChats.map(chat => ({
      ...chat, 
      timestamp: chat.timestamp || Date.now() - uniqueChats.indexOf(chat) * 1000  // Timestamp artificial se não existir
    }));
    return chatsWithTimestamp.sort((a, b) => b.timestamp - a.timestamp);
  });

  // ID da sessão atual
  const [sessionId, setSessionId] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const chatIdFromURL = urlParams.get("chatId");
    const storedSessionId = localStorage.getItem(`sessionId_${user?.sub || user?.email || "default"}`) || null;
    return chatIdFromURL || storedSessionId;
  });

  // Mensagens da sessão atual
  const [messages, setMessages] = useState([]);
  
  // Estado de digitação
  const [isThinking, setIsThinking] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [phraseIndex, setPhraseIndex] = useState(0);
  
  // Modo API (normal ou AV)
  const [useAV, setUseAV] = useState(false);
  
  // Estado para forçar a exibição do chat
  const [forceShowChat, setForceShowChat] = useState(false);

  // Valor do input
  const [inputValue, setInputValue] = useState("");

  // Estado para controlar o menu de opções dos chats
  const [openMenuChatId, setOpenMenuChatId] = useState(null);

  // Função para obter mensagens armazenadas
  const getUserStoredMessages = useCallback((sid) => {
    return getStoredMessages(sid, user?.sub || user?.email || "default");
  }, [user]);

  // Função para armazenar mensagens
  const saveUserMessages = useCallback((sid, msgs) => {
    storeMessages(sid, msgs, user?.sub || user?.email || "default");
  }, [user]);

  // Função para remover mensagens
  const removeUserMessages = useCallback((chatId) => {
    removeMessagesForChatId(chatId, user?.sub || user?.email || "default");
  }, [user]);

  // Função para criar nova sessão
  const createNewSession = useCallback(() => {
    // Criar novo ID
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);

    // Adicionar à lista de chats com timestamp
    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName, timestamp: Date.now() };
    setChatList((prev) => {
      const updatedList = [newChat, ...prev]; // Adiciona no início para aparecer no topo
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
    
    // Resetar para a tela inicial com os botões
    setForceShowChat(false);
    setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
  }, [chatList, user]);

  // Função para adicionar chat à lista se estiver faltando
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

  // Função para selecionar um chat
  const handleSelectChat = useCallback((chatId) => {
    setSessionId(chatId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, chatId);
    updateURLWithChatId(chatId);
    setOpenMenuChatId(null);
  }, [user]);

  // Função para renomear chat
  const handleRenameChat = useCallback((chatId, newName) => {
    if (chatId && newName && newName.trim()) {
      // Atualizar a lista
      setChatList(prev => 
        prev.map(chat => chat.id === chatId ? { ...chat, name: newName.trim() } : chat)
      );
    }
  }, []);

  // Função para excluir chat
  const handleDeleteChat = useCallback((chatId) => {
    setChatList((prev) => prev.filter((chat) => chat.id !== chatId));
    removeUserMessages(chatId);
    
    if (sessionId === chatId) {
      setSessionId(null);
      setMessages([]);
    }
  }, [sessionId, removeUserMessages]);

  // Função para enviar mensagem
  const handleSendMessage = useCallback(async (customMsg) => {
    if (isThinking) return;
    
    // Se customMsg for null, isso significa que estamos apenas iniciando uma nova sessão sem enviar mensagem
    if (customMsg === null) return;

    const textToSend = customMsg || inputValue.trim();
    if (!textToSend) return;

    if (!customMsg) {
      setInputValue("");
    }

    setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    setIsThinking(true);
    setShowThinking(true);

    try {
      // Escolher o endpoint baseado no modo selecionado
      const endpoint = useAV ? "https://api.theway.altavistainvest.com.br/api/thewayiaav" : "https://api.theway.altavistainvest.com.br/api/agent";
      console.log(`Enviando requisição para ${endpoint} (modo AV: ${useAV ? "ativado" : "desativado"})`);
      
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        timeout: 180000, // 3 minutos
        body: JSON.stringify({
          message: textToSend,
          sessionId: sessionId,
          userName: user?.name || "",
          userId: user?.sub || "",
          userEmail: user?.email || ""
        })
      });
      const data = await response.json();
      let botReply = data.reply || "Erro: sem resposta.";
      setMessages((prev) => [...prev, { role: "assistant", content: botReply }]);
    } catch (err) {
      console.error(`Erro ao chamar ${useAV ? '/api/thewayiaav' : '/api/agent'}:`, err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Ocorreu um erro ao obter a resposta." }
      ]);
    } finally {
      setIsThinking(false);
      setShowThinking(false);
    }
  }, [inputValue, isThinking, sessionId, useAV, user]);

  // Função para lidar com planejamento financeiro
  const handlePlanningButtonClick = useCallback((text, isAVMode = false) => {
    // Definir modo API (TheWay-IA AV ou normal)
    setUseAV(isAVMode);
    
    // Forçar a transição para a interface de chat
    setForceShowChat(true);
    
    // Criar uma nova sessão para o chat
    const newId = crypto.randomUUID();
    setSessionId(newId);
    localStorage.setItem(`sessionId_${user?.sub || user?.email || "default"}`, newId);
    updateURLWithChatId(newId);
    
    // Adicionar novo chat na lista com timestamp
    const newChatName = getUniqueChatName(chatList);
    const newChat = { id: newId, name: newChatName, timestamp: Date.now() };
    setChatList((prev) => {
      const updatedList = [newChat, ...prev]; // Adiciona no início para aparecer no topo
      return Array.from(new Map(updatedList.map(item => [item.id, item])).values());
    });
    
    // Para o modo AV, não enviamos mensagem, apenas mantemos a mensagem de boas-vindas
    if (isAVMode) {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
      return;
    }
    
    // Primeiro, definimos as mensagens iniciais de forma consistente
    const initialMessages = [
      { role: "assistant", content: getInitialMessage(user) },
      { role: "user", content: text } // Usar o texto passado pelo botão
    ];
    setMessages(initialMessages);
    
    // Agora simulamos uma resposta do assistente após uma pausa para garantir que a UI exiba a mensagem do usuário
    setIsThinking(true);
    setShowThinking(true);
    
    // Esperar 500ms para garantir que a UI atualize e mostre a mensagem do usuário antes de iniciar a requisição
    setTimeout(async () => {
      try {
        // Fazer a requisição para o servidor
        const endpoint = "https://api.theway.altavistainvest.com.br/api/agent";
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text, // Usar o texto passado pelo botão
            sessionId: newId,
            userName: user?.name || "",
            userId: user?.sub || "",
            userEmail: user?.email || ""
          })
        });
        
        const data = await response.json();
        let botReply = data.reply || "Olá! Vou ajudar você com seu planejamento financeiro. Para começarmos, poderia me contar um pouco sobre seus objetivos financeiros atuais?";
        
        // Atualizar as mensagens com a resposta, mantendo a mensagem do usuário
        setMessages([{ role: "assistant", content: getInitialMessage(user) },
                     { role: "user", content: text },
                     { role: "assistant", content: botReply }]);
      } catch (err) {
        console.error(`Erro ao chamar /api/agent:`, err);
        // Fallback para uma resposta padrão em caso de erro, mantendo a mensagem do usuário
        setMessages([{ role: "assistant", content: getInitialMessage(user) },
                     { role: "user", content: text },
                     { role: "assistant", content: `Olá! Vou ajudar você com seu planejamento financeiro conforme solicitado: "${text}". Para começarmos, poderia me contar um pouco sobre seus objetivos financeiros atuais?` }]);
      } finally {
        setIsThinking(false);
        setShowThinking(false);
      }
    }, 500); // Aumentamos para 500ms para garantir que a UI tenha tempo de atualizar
  }, [chatList, user, setIsThinking, setShowThinking]);

  // Efeito para salvar a lista de chats no localStorage
  useEffect(() => {
    localStorage.setItem(`chatList_${user?.sub || user?.email || "default"}`, JSON.stringify(chatList));
  }, [chatList, user]);

  // Efeito para inicializar a sessão se necessário
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

  // Efeito para carregar mensagens ao trocar de sessão
  useEffect(() => {
    if (!sessionId) return;
    const stored = getUserStoredMessages(sessionId);
    if (stored.length > 0) {
      setMessages(stored);
    } else {
      setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    }
  }, [sessionId, user, getUserStoredMessages]);

  // Efeito para salvar mensagens ao alterá-las
  useEffect(() => {
    if (sessionId && messages.length > 0) {
      // Verificação para debug
      console.log(`Mensagens salvas para sessão ${sessionId}:`, messages);
      
      // Garante que todas as mensagens, incluindo a do usuário, sejam salvas
      saveUserMessages(sessionId, messages);
    }
  }, [messages, sessionId, saveUserMessages]);

  // Verificação se há mensagens de usuário
  const hasUserMessage = messages.some((m) => m.role === "user");
  
  // Estado para controlar exibição dos botões iniciais
  const showInitialButtons = !hasUserMessage && !forceShowChat;

  // Função para resetar para tela inicial
  const resetToButtons = useCallback(() => {
    setForceShowChat(false);
    setMessages([{ role: "assistant", content: getInitialMessage(user) }]);
    
    // Limpar as mensagens armazenadas
    if (sessionId) {
      saveUserMessages(sessionId, [{ role: "assistant", content: getInitialMessage(user) }]);
    }
  }, [sessionId, saveUserMessages, user]);

  return {
    chatList,
    sessionId,
    messages,
    isThinking,
    showThinking,
    phraseIndex,
    setPhraseIndex,
    useAV,
    forceShowChat,
    inputValue,
    setInputValue,
    openMenuChatId,
    setOpenMenuChatId,
    showInitialButtons,
    createNewSession,
    handleSelectChat,
    handleRenameChat,
    handleDeleteChat,
    handleSendMessage,
    handlePlanningButtonClick,
    resetToButtons
  };
}
