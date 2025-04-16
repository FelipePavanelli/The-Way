document.addEventListener('DOMContentLoaded', function() {
    // Elementos DOM relacionados ao chat
    const chatContainer = document.querySelector('.chat-container');
    const messagesContainer = document.getElementById('messages-container');
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const emailButton = document.getElementById('email-button');
    const initialButtons = document.getElementById('initial-buttons');
    const messageInputContainer = document.getElementById('message-input-container');
    const suggestionButtons = document.querySelectorAll('.suggestion-button');
    const chatButtons = document.querySelectorAll('.chat-button');
    const scrollToBottomBtn = document.getElementById('scroll-to-bottom');

    // Estado da aplicação
    let currentChatId = null;

    // Inicialização
    init();

    function init() {
        // Configurar event listeners
        setupEventListeners();

        // Verificar posição inicial do scroll
        checkScrollPosition();
    }

    function setupEventListeners() {
        // Chat
        sendButton.addEventListener('click', sendUserMessage);
        emailButton.addEventListener('click', handleEmailButton);
        messageInput.addEventListener('keydown', handleTextareaKeydown);
        messageInput.addEventListener('input', autoResizeTextarea);

        // Botões de sugestão
        suggestionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const message = button.getAttribute('data-message');
                sendMessage(message);
                hideInitialButtons();
                showMessageInput();
            });
        });

        // Controle de scroll
        chatContainer.addEventListener('scroll', checkScrollPosition);
        scrollToBottomBtn.addEventListener('click', scrollToBottom);
    }

    function autoResizeTextarea() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    }

    function hideInitialButtons() {
        initialButtons.classList.add('hidden');
    }

    function showMessageInput() {
        messageInputContainer.classList.add('visible');
        messageInput.focus();
    }

    // Funções de Chat
    async function sendMessage(text) {
        // Validação básica
        if (!text.trim()) return;
        addMessage('user', text);
        scrollToBottom();
        showTypingIndicator();

        try {
            // Configuração da requisição
            const requestConfig = {
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                }
            };

            // Capturar o sessionId da meta tag
            const sessionId = document.querySelector('meta[name="session-id"]').content;

            const response = await axios.post(
                '/chat/process-message',
                {
                    userMessage: text,
                    sessionId: sessionId
                },
                requestConfig
            );

                removeTypingIndicator();
                // Verifica se há resposta da API
                if (response.data) {
                    addMessage('assistant', response.data);
                }
                scrollToBottom();

        } catch (error) {
            removeTypingIndicator();
            addMessage('assistant', 'Erro ao processar sua mensagem, tente novamente');
            scrollToBottom();
            console.error('Erro na requisição:', error);
        }
    }

    function sendUserMessage() {
        const text = messageInput.value.trim();
        if (text) {
            sendMessage(text);
            messageInput.value = '';
            messageInput.style.height = 'auto';
        }
    }

    function addMessage(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message fade-in`;

        if (sender === 'assistant') {
            messageDiv.innerHTML = text;
        }
        else {
            messageDiv.innerHTML = `<p>${text}</p>`;
        }

        messagesContainer.appendChild(messageDiv);
    }

    function showTypingIndicator() {
        const existingIndicator = document.querySelector('.typing-indicator');
        if (existingIndicator) return;

        // Disable input and send button
        messageInput.disabled = true;
        messageInput.placeholder = "The Way está digitando...";
        sendButton.disabled = true;
        sendButton.classList.add('disabled');

        const typingMessages = [
            "Pensando",
            "Analisando sua mensagem",
            "Processando informações",
            "Elaborando resposta",
            "Considerando opções",
            "Avaliando alternativas",
            "Organizando dados",
            "Calculando resultados"
        ];

        // Shuffle array to randomize message order
        const shuffledMessages = [...typingMessages].sort(() => Math.random() - 0.5);
        let currentMessageIndex = 0;

        const typingDiv = document.createElement('div');
        typingDiv.className = 'message assistant-message typing-message';
        typingDiv.innerHTML = `
            <div class="typing-indicator-container">
                <div class="typing-text">${shuffledMessages[currentMessageIndex]}</div>
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        scrollToBottom();

        // Add continuous blinking fade effect
        const textElement = typingDiv.querySelector('.typing-text');
        let fadeInterval = setInterval(() => {
            textElement.style.transition = 'opacity 0.5s ease-in-out';
            textElement.style.opacity = textElement.style.opacity === '0.5' ? '1' : '0.5';
        }, 1000);

        // Change message every 3 seconds with fade animation
        const changeInterval = setInterval(() => {
            // Fade out completely before changing
            textElement.style.transition = 'opacity 0.3s ease';
            textElement.style.opacity = '0';

            setTimeout(() => {
                // Update message
                currentMessageIndex = (currentMessageIndex + 1) % shuffledMessages.length;
                textElement.textContent = shuffledMessages[currentMessageIndex];

                // Fade in to blinking state
                setTimeout(() => {
                    textElement.style.opacity = '0.5';
                }, 10);
            }, 300);
        }, 3000);

        // Store interval IDs so we can clear them later
        typingDiv.dataset.fadeIntervalId = fadeInterval;
        typingDiv.dataset.changeIntervalId = changeInterval;
    }

    function removeTypingIndicator() {
        const typingMessage = document.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }

        // Reabilita o input e o botão de enviar
        messageInput.disabled = false;
        messageInput.placeholder = "Mensagem para o The Way";
        sendButton.disabled = false;
        sendButton.classList.remove('disabled');
        messageInput.focus(); // Opcional: retorna o foco para o input
    }

    function handleTextareaKeydown(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendUserMessage();
        }
    }

    function handleEmailButton() {
        alert("Funcionalidade de e-mail seria implementada aqui");
    }


    // Funções de Scroll
    function checkScrollPosition() {
        const threshold = 100;
        const isAtBottom = chatContainer.scrollHeight - chatContainer.scrollTop - chatContainer.clientHeight < threshold;

        if (isAtBottom) {
            scrollToBottomBtn.classList.remove('visible');
        } else {
            scrollToBottomBtn.classList.add('visible');
        }
    }

    function scrollToBottom() {
        chatContainer.scrollTo({
            top: chatContainer.scrollHeight,
            behavior: 'smooth'
        });

        // Esconde o botão após rolar
        setTimeout(() => {
            checkScrollPosition();
        }, 500);
    }
});
