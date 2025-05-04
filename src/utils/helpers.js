// Função auxiliar para verificar se um elemento contém outro de forma segura
export function safeContains(element, target) {
  try {
    return element && typeof element.contains === 'function' && element.contains(target);
  } catch (error) {
    console.error("Erro ao verificar contains:", error);
    return false;
  }
}

// Função para gerar um nome único para o chat
export function getUniqueChatName(chatList) {
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

// Função para obter a inicial do nome de usuário
export function getUserInitial(user) {
  if (!user) return "z";
  const name = user.name || user.nickname || user.email || "z";
  return name.charAt(0).toUpperCase();
}

// Função para obter a mensagem inicial
export function getInitialMessage(user) {
  return `Como posso te ajudar hoje?`;
}

// Função para formatar mensagens como HTML
export function formatMessage(message) {
  return message.replace(/\n/g, "<br>");
}

// Função para verificar se deve usar tema escuro
export function shouldUseDarkTheme() {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// Função para atualizar URL com ID do chat
export function updateURLWithChatId(id) {
  const url = new URL(window.location.href);
  url.searchParams.set("chatId", id);
  window.history.replaceState({}, "", url.toString());
}

// Função para obter mensagens armazenadas
export function getStoredMessages(sessionId, userId) {
  const raw = localStorage.getItem(`messagesBySession_${userId || "default"}`);
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  return parsed[sessionId] || [];
}

// Função para armazenar mensagens
export function storeMessages(sessionId, messages, userId) {
  // Verificar se há mensagens do usuário antes de salvar
  const userMessages = messages.filter(m => m.role === "user");
  console.log(`Salvando ${messages.length} mensagens para sessão ${sessionId}, incluindo ${userMessages.length} do usuário:`, userMessages);

  const raw = localStorage.getItem(`messagesBySession_${userId || "default"}`);
  const parsed = raw ? JSON.parse(raw) : {};
  parsed[sessionId] = messages;
  localStorage.setItem(`messagesBySession_${userId || "default"}`, JSON.stringify(parsed));
}

// Função para remover mensagens de um chat específico
export function removeMessagesForChatId(chatId, userId) {
  const raw = localStorage.getItem(`messagesBySession_${userId || "default"}`);
  if (!raw) return;
  const parsed = JSON.parse(raw);
  delete parsed[chatId];
  localStorage.setItem(`messagesBySession_${userId || "default"}`, JSON.stringify(parsed));
}

// Array de frases de pensamento para o indicador de "digitando"
export const thinkingPhrases = [
  "Pensando",
  "Analisando sua mensagem",
  "Processando informações",
  "Elaborando resposta",
  "Considerando opções",
  "Avaliando alternativas",
  "Organizando dados",
  "Calculando resultados"
];
