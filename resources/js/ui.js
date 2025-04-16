document.addEventListener('DOMContentLoaded', function () {
    // Elementos DOM
    const chatListPanel = document.getElementById('chat-list-panel');
    const toggleChatListBtn = document.getElementById('toggle-chat-list');
    const toggleDarkModeBtn = document.getElementById('toggle-dark-mode');
    const profileMenu = document.getElementById('profile-menu-dropdown');
    const toggleProfileMenuBtn = document.getElementById('toggle-profile-menu');

    // Inicialização
    init();

    function init() {
        // Configurar tema inicial (light mode padrão)
        setInitialTheme();

        // Configurar event listeners
        setupEventListeners();
    }

    function setInitialTheme() {
        // Verificar preferência armazenada (cookie tem prioridade)
        const darkModeCookie = getCookie('dark_mode');
        const prefersDark = darkModeCookie ? darkModeCookie === 'true' : false;

        // Aplicar tema
        if (prefersDark) {
            enableDarkMode(false); // false para não enviar requisição
        } else {
            enableLightMode(false);
        }
    }

    function setupEventListeners() {
        // UI
        toggleChatListBtn.addEventListener('click', toggleChatList);
        toggleDarkModeBtn.addEventListener('click', toggleDarkMode);
        toggleProfileMenuBtn.addEventListener('click', toggleProfileMenu);
        document.addEventListener('click', closeAllMenus);
    }

    // Funções de Tema
    function toggleDarkMode() {
        const isDark = document.body.classList.contains('dark-mode');

        if (isDark) {
            enableLightMode();
        } else {
            enableDarkMode();
        }
    }

    function enableDarkMode(sendRequest = true) {
        document.body.classList.add('dark-mode');
        document.body.classList.remove('light-mode');
        document.documentElement.classList.add('dark-mode');

        // Atualizar ícone
        const icon = toggleDarkModeBtn.querySelector('i');
        icon.classList.add('fa-sun');
        icon.classList.remove('fa-moon');

        // Armazenar preferência
        setCookie('dark_mode', 'true', 30);

        // Enviar requisição se necessário
        if (sendRequest) {
            saveThemePreference(true);
        }
    }

    function enableLightMode(sendRequest = true) {
        document.body.classList.add('light-mode');
        document.body.classList.remove('dark-mode');
        document.documentElement.classList.remove('dark-mode');

        // Atualizar ícone
        const icon = toggleDarkModeBtn.querySelector('i');
        icon.classList.add('fa-moon');
        icon.classList.remove('fa-sun');

        // Armazenar preferência
        setCookie('dark_mode', 'false', 30);

        // Enviar requisição se necessário
        if (sendRequest) {
            saveThemePreference(false);
        }
    }

    function saveThemePreference(isDark) {
        fetch("{{ route('chat') }}?toggle_dark_mode=1", {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        }).catch(error => {
            console.error('Error saving theme preference:', error);
        });
    }

    // Funções de UI
    function toggleChatList() {
        const isVisible = chatListPanel.classList.toggle('visible');
        toggleChatListBtn.setAttribute('aria-expanded', isVisible);
        chatListPanel.setAttribute('aria-hidden', !isVisible);

        if (isVisible) {
            profileMenu.classList.remove('visible');
            toggleProfileMenuBtn.setAttribute('aria-expanded', false);
        }
    }

    function toggleProfileMenu(e) {
        e.stopPropagation();
        const isVisible = profileMenu.classList.toggle('visible');
        toggleProfileMenuBtn.setAttribute('aria-expanded', isVisible);

        if (isVisible) {
            chatListPanel.classList.remove('visible');
            toggleChatListBtn.setAttribute('aria-expanded', false);
        }
    }

    function closeAllMenus(e) {
        if (!toggleProfileMenuBtn.contains(e.target) && !profileMenu.contains(e.target)) {
            profileMenu.classList.remove('visible');
            toggleProfileMenuBtn.setAttribute('aria-expanded', false);
        }

        if (!toggleChatListBtn.contains(e.target) && !chatListPanel.contains(e.target)) {
            chatListPanel.classList.remove('visible');
            toggleChatListBtn.setAttribute('aria-expanded', false);
        }
    }

    // Funções auxiliares
    function setCookie(name, value, days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        document.cookie = `${name}=${value};expires=${date.toUTCString()};path=/`;
    }

    function getCookie(name) {
        return document.cookie.split('; ')
            .find(row => row.startsWith(`${name}=`))
            ?.split('=')[1];
    }
});


document.addEventListener('DOMContentLoaded', function () {
    // Variável para controlar o chat sendo editado
    let currentEditingChat = null;

    // Função para ativar o modo de edição
    function activateEditMode(chatItem) {
        // Desativa qualquer edição em andamento
        if (currentEditingChat && currentEditingChat !== chatItem) {
            deactivateEditMode(currentEditingChat);
        }

        // Ativa o modo de edição
        chatItem.classList.add('editing');
        const input = chatItem.querySelector('.chat-edit-input');
        input.focus();
        input.select();
        currentEditingChat = chatItem;
    }

    // Função para desativar o modo de edição e salvar
    function deactivateEditMode(chatItem) {
        if (!chatItem) return;

        const input = chatItem.querySelector('.chat-edit-input');
        const nameSpan = chatItem.querySelector('.chat-name');
        const newName = input.value.trim();
        const originalName = nameSpan.textContent;

        chatItem.classList.remove('editing');
        currentEditingChat = null;

        // Se o nome foi alterado, faz a requisição
        if (newName && newName !== originalName) {
            const chatId = chatItem.dataset.chatId;

            axios.put(`/chats/${chatId}`, {
                name: newName
            })
                .then(response => {
                    nameSpan.textContent = newName;
                })
                .catch(error => {
                    console.error('Erro ao atualizar chat:', error);
                    input.value = originalName; // Reverte se der erro
                });
        }
    }

    // Evento de clique no botão editar
    document.querySelectorAll('.edit-chat').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const chatItem = this.closest('.chat-item');
            activateEditMode(chatItem);
        });
    });

    // Evento de clique fora para salvar
    document.addEventListener('click', function (e) {
        if (currentEditingChat && !currentEditingChat.contains(e.target)) {
            deactivateEditMode(currentEditingChat);
        }
    });

    // Evento de tecla Enter para salvar
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && currentEditingChat) {
            deactivateEditMode(currentEditingChat);
        }
    });

    // Evento de tecla Escape para cancelar
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && currentEditingChat) {
            const input = currentEditingChat.querySelector('.chat-edit-input');
            const nameSpan = currentEditingChat.querySelector('.chat-name');
            input.value = nameSpan.textContent; // Reverte para o valor original
            currentEditingChat.classList.remove('editing');
            currentEditingChat = null;
        }
    });

    // Função para mostrar notificação
    function showNotification(message, type = 'success') {
        const container = document.getElementById('notification-container');
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${message}</span>
        `;

        container.appendChild(notification);

        // Remove a notificação após a animação
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Evento de deletar chat
    document.querySelectorAll('.delete-chat').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();

            const chatItem = this.closest('.chat-item');
            const chatId = chatItem.dataset.chatId;
            const popup = document.getElementById('delete-confirmation-popup');
            const cancelButton = popup.querySelector('.cancel-button');
            const confirmButton = popup.querySelector('.confirm-button');

            // Show popup with animation
            popup.style.display = 'flex';
            popup.style.opacity = '0';
            setTimeout(() => {
                popup.style.opacity = '1';
            }, 10);

            // Cancel button handler
            cancelButton.onclick = function () {
                popup.style.opacity = '0';
                setTimeout(() => {
                    popup.style.display = 'none';
                }, 200);
            };

            // Confirm button handler
            confirmButton.onclick = function () {
                // Disable buttons during request
                confirmButton.disabled = true;
                cancelButton.disabled = true;
                confirmButton.textContent = 'Excluindo...';

                axios.delete(`/chats/${chatId}`)
                    .then(response => {
                        // Fade out the chat item
                        chatItem.style.opacity = '0';
                        setTimeout(() => {
                            chatItem.remove();
                            popup.style.opacity = '0';
                            setTimeout(() => {
                                popup.style.display = 'none';
                            }, 200);
                            // Show success notification
                            showNotification('Chat excluído com sucesso!');
                        }, 200);
                    })
                    .catch(error => {
                        console.error('Erro ao deletar chat:', error);
                        showNotification('Erro ao excluir o chat', 'error');
                        popup.style.opacity = '0';
                        setTimeout(() => {
                            popup.style.display = 'none';
                        }, 200);
                    })
                    .finally(() => {
                        // Re-enable buttons
                        confirmButton.disabled = false;
                        cancelButton.disabled = false;
                        confirmButton.textContent = 'Excluir';
                    });
            };

            // Close popup when clicking outside
            popup.onclick = function (e) {
                if (e.target === popup) {
                    popup.style.opacity = '0';
                    setTimeout(() => {
                        popup.style.display = 'none';
                    }, 200);
                }
            };

            // Close popup with Escape key
            document.addEventListener('keydown', function handleEscape(e) {
                if (e.key === 'Escape') {
                    popup.style.opacity = '0';
                    setTimeout(() => {
                        popup.style.display = 'none';
                    }, 200);
                    document.removeEventListener('keydown', handleEscape);
                }
            });
        });
    });
});
