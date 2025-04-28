<footer class="app-footer">
    <div class="input-container">
        <div class="initial-buttons @if(!is_null($conversations)) hidden @endif" id="initial-buttons">
            <button class="suggestion-button" data-message="Quero fazer um Planejamento Financeiro passo a passo.">
                Planejamento Financeiro passo a passo
            </button>
        </div>

        <div class="message-input-container @if(!is_null($conversations)) visible @endif" id="message-input-container">
            <div class="input-wrapper">
                <textarea id="message-input" placeholder="Mensagem para o The Way" rows="1"
                    aria-label="Digite sua mensagem"></textarea>
                <div class="input-actions">
                    <a href="{{ env('LINK_RELATORIO') }}/?sessionId={{ $sessionId }}" target="_blank"
                        class="action-button report-button" aria-label="Gerar Relatório">
                        <i class="fas fa-file-alt" aria-hidden="true"></i>
                        <span class="report-text">Gerar Relatório</span>
                    </a>
                    <button class="action-button send-button" id="send-button" aria-label="Enviar mensagem">
                        <i class="fas fa-arrow-up" aria-hidden="true"></i>
                    </button>
                </div>
            </div>
        </div>
    </div>
    <div class="footer-credits">
        <p>Todos os direitos reservados a Alta Vista Investimentos - V1.0.6</p>
    </div>
</footer>
<button id="scroll-to-bottom" class="scroll-to-bottom-button" aria-label="Rolar para baixo">
    <i class="fas fa-arrow-down" aria-hidden="true"></i>
</button>
