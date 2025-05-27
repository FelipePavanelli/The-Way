const express = require('express');
const axios = require('axios');
const qs = require('qs');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // 🔧 ADICIONE ISSO
const port = 4000;

// Redireciona para o login do Auth0
app.get('/oauth/login', (req, res) => {
  const {
    response_type,
    client_id,
    redirect_uri,
    state,
    scope
  } = req.query;

  const authUrl = `https://${process.env.AUTH0_DOMAIN}/authorize` +
    `?response_type=${encodeURIComponent(response_type)}` +
    `&client_id=${encodeURIComponent(client_id)}` +
    `&redirect_uri=${encodeURIComponent(redirect_uri)}` +
    `&state=${encodeURIComponent(state)}` +
    `&scope=${encodeURIComponent(scope)}`;

  res.redirect(authUrl);
});


// Recebe o código do Auth0 e troca por token
app.post('/oauth/token', async (req, res) => {
  try {
    const { code } = req.body;

    const response = await axios.post(
      `https://${process.env.AUTH0_DOMAIN}/oauth/token`,
      qs.stringify({
        grant_type: 'authorization_code',
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        code,
        redirect_uri: process.env.AUTH0_CALLBACK_URL,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
});

// Exemplo de endpoint protegido
app.get('/me', (req, res) => {
  // Aqui você validaria o token recebido via Auth0 (Bearer token)...
  res.json({ user: 'dados do usuário autenticado' });
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
