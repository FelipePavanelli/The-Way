<header class="app-header">
    <div class="header-left">
        <a class="logo" href="{{ url('/') }}" class="home-link">
            <img src="{{ asset('images/logo.svg') }}" alt="Logo The Way" class="logo">
        </a>
    </div>
    <div class="header-center">
        <h1 class="app-title">The Way</h1>
    </div>
    <div class="header-right">
        <div class="header-icons">
            <button class="icon-button" id="toggle-chat-list" aria-label="Abrir menu de chats" aria-expanded="false">
                <i class="fas fa-bars" aria-hidden="true"></i>
            </button>
            <button class="icon-button" id="toggle-dark-mode" aria-label="Alternar modo escuro">
                <i class="fas {{ session('dark_mode') ? 'fa-sun' : 'fa-moon' }}" aria-hidden="true"></i>
            </button>
            <div class="profile-menu-container">
                <button class="profile-button" id="toggle-profile-menu" aria-label="Menu do perfil" aria-expanded="false">
                    {{ strtoupper(substr(auth()->user()->name, 0, 1)) }}
                </button>
                <div id="profile-menu-dropdown" class="profile-menu-dropdown">
                    <ul class="menu-list">
                        <li class="menu-item">
                            <a href="https://altavista.aawz.com.br/login/email" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-dollar-sign" aria-hidden="true"></i>
                                <span>AV Comissões</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="https://altavista.tradeinsights.com/inicio" target="_blank" rel="noopener noreferrer">
                                <i class="fas fa-chart-line" aria-hidden="true"></i>
                                <span>TradeInsights</span>
                            </a>
                        </li>
                        <li class="menu-item">
                            <a href="https://altavista.tradeinsights.com/inicio" target="_blank" rel="noopener noreferrer">
                                <i class="fa-brands fa-hubspot" aria-hidden="true"></i>
                                <span>HubSpot</span>
                            </a>
                        </li>
                        <li class="menu-item logout">
                            <a class="logout" href="{{ route('logout') }}">
                                <i class="fas fa-sign-out-alt" aria-hidden="true"></i>
                                <span>Sair</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</header>
