<aside id="chat-list-panel" class="chat-list-panel" aria-hidden="true">
    <h2 class="panel-title">Meus Chats</h2>
    <ul class="chat-list">
        @if($chats->isNotEmpty())
        @foreach($chats as $index => $chat)
        <li class="chat-item {{ $chat->session_id === $sessionId ? 'active' : '' }}" data-chat-id="{{ $chat->session_id }}">
            <!-- Modo visualização -->
            <div class="chat-view-mode">
                <a href="{{ route('chat', ['sessionId' => $chat->session_id]) }}" class="chat-button">
                    <span class="chat-name">{{ $chat->name ?: 'Chat ' . ($index + 1) }}</span>
                </a>
                <div class="chat-actions">
                    <button class="edit-chat" title="Editar nome">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                    </button>
                    <button class="delete-chat" title="Excluir chat">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M3 6h18"></path>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Modo edição -->
            <div class="chat-edit-mode">
                <input type="text" class="chat-edit-input" value="{{ $chat->name ?: 'Chat ' . ($index + 1) }}">
            </div>
        </li>
        @endforeach
        @endif
    </ul>
    <a href="{{ route('chat') }}" class="new-chat-button" id="create-new-chat">
        <i class="fas fa-plus" aria-hidden="true"></i>
        Novo Chat
    </a>
</aside> 