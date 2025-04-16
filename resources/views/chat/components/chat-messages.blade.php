<main class="chat-container">
    <div class="messages-container" id="messages-container" role="log" aria-live="polite">
        <div class="message assistant-message fade-in" role="status">
            <p>Como posso te ajudar hoje?</p>
        </div>
        @if(!is_null($conversations))
        @foreach($conversations as $message)
            <!-- Mensagem do Usuário -->
            @if($message->role == 'user')
            <div class="message user-message fade-in">
                <p>{{ $message->content}}</p>
            </div>
            @endif
            <!-- Resposta do Assistente -->
            @if($message->role == 'assistant')
            <div class="message assistant-message fade-in" role="status">
                {!! Illuminate\Support\Str::markdown($message->content) !!}
            </div>
            @endif
        @endforeach
        @endif
    </div>
</main> 