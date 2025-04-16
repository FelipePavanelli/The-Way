# 🚀 The Way

## 🛠️ Stack Tecnológica

<div align="center">
  
| Componente       | Versão      | Finalidade                          |
|------------------|-------------|------------------------------------|
| Laravel          | 12.x        | Framework PHP principal            |
| PHP              | 8.4         | Backend da aplicação               |
| Node.js          | 20.x        | Gerenciamento de assets frontend   |
| PostgreSQL       | 15.x        | Banco de dados relacional          |
| Redis            | 7.x         | Cache e gerenciamento de sessões   |
| Nginx            | Latest      | Servidor web                       |
| Mailpit          | Latest      | Servidor SMTP para desenvolvimento|

</div>

## 🚦 Primeiros Passos

### 🔧 Configuração Inicial

**Configuração do ambiente**:
   - Copie o arquivo `.env.example` para `.env`
   - Configure as variáveis de ambiente conforme seu ambiente:

   ```ini
   # Configurações do PostgreSQL Docker
   DB_CONNECTION=pgsql
   DB_HOST=db
   DB_PORT=5432
   DB_DATABASE=pgdatabase
   DB_USERNAME=pguser
   DB_PASSWORD=pgpassword

   # Configurações do Redis Docker
   REDIS_HOST=redis
   REDIS_PASSWORD=null
   REDIS_PORT=6379

   # Configurações de Email Docker
   MAIL_MAILER=smtp
   MAIL_HOST=mailpit
   MAIL_PORT=1025
   ```
## 🏁 Primeiros Passos

### Inicie os containers:
docker-compose up -d --build

### Acessar o container principal
docker-compose exec app bash

### Instalar dependências PHP (dentro do container)
composer install

### Executar migrações do banco
php artisan migrate

### Instalar dependências frontend
docker-compose exec node npm install

### Iniciar Vite para desenvolvimento
docker-compose exec node npm run dev


| Serviço          | URL/Acesso               |
|------------------|--------------------------|
| Aplicação Web    | http://localhost         |
| Mailpit (Web UI) | http://localhost:8025    |


## Configuração do Auth0

Para que os usuários possam se autenticar na aplicação, é necessário configurar os arquivos de credenciais do Auth0.

### Arquivos necessários

### 1. `.auth0.api.json`
Este arquivo contém as credenciais para a API (backend).

### 2. `.auth0.app.json`
Este arquivo contém as credenciais  aplicativo (frontend).


## 🛠️ Comandos Úteis

### Limpar cache da aplicação
docker-compose exec app php artisan optimize:clear

### Limpar cache do Redis
docker-compose exec redis redis-cli FLUSHALL

### Reinstalar todas as dependências
docker-compose exec app rm -rf vendor composer.lock && composer install

### Ver logs em tempo real
docker-compose logs -f app
