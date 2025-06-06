// server.js
const express = require("express");
const cors = require("cors");
const fetch = require("node-fetch").default;
const { v4: uuidv4 } = require("uuid");

const app = express();

// Habilita CORS
app.use(cors());

// Faz parse automático de JSON no body (em vez de express.raw())
app.use(express.json());

// Define o tempo limite da API para 40% maior que o padrão
// O padrão do Node.js é 120000ms (2 minutos)
// Aumentamos para 168000ms (2.8 minutos)
app.use((req, res, next) => {
  req.setTimeout(168000); // 120000 * 1.4 = 168000ms
  res.setTimeout(168000);
  next();
});

// Função auxiliar para extrair dados do body (agora já é JSON)
function parseBody(body) {
  // body já é um objeto (req.body)
  const {
    message = "",
    sessionId = null,
    userName = "",
    userId = "",
    userEmail = ""
  } = body || {};

  return { message, sessionId, userName, userId, userEmail };
}

// Exemplo de rota GET
app.get("/", (req, res) => {
  res.send("API está rodando corretamente!");
});

// Rota principal do agente
app.post("/api/agent", async (req, res) => {
  // Extrai dados do body
  const { message, sessionId, userName, userId, userEmail } = parseBody(req.body);
  const finalSessionId = sessionId || uuidv4();

  try {
    const flowResp = await fetch(
      "https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          sessionId: finalSessionId,
          userName,
          userId,
          userEmail
        })
      }
    );

    const rawText = await flowResp.text();
    let data;
    try {
      data = JSON.parse(rawText); // tenta interpretar como JSON
    } catch (err) {
      console.error("[DEBUG] Resposta não é JSON. Pode ser HTML de erro.\n", rawText);
      data = { reply: rawText }; // se não for JSON, tratamos como texto
    }

    let reply = data.reply || "Erro: sem resposta.";
    // Substituições
    reply = reply.replace("{data_atual}", new Date().toLocaleString("pt-BR"));
    reply = reply.replace(/\bundefined\b/g, "");

    // Logar no console
    console.log("[DEBUG] JSON enviado ao n8n:", JSON.stringify({
      userMessage: message,
      sessionId: finalSessionId,
      userName,
      userId,
      userEmail
    }, null, 2));

    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao chamar Flow:", err);
    return res.status(500).json({ error: "Falha ao chamar Flow" });
  }
});

// Nova rota thewayiaav nos mesmos moldes da anterior
app.post("/api/thewayiaav", async (req, res) => {
  // Extrai dados do body
  const { message, sessionId, userName, userId, userEmail } = parseBody(req.body);
  const finalSessionId = sessionId || uuidv4();

  try {
    const flowResp = await fetch(
      "https://n8n.altavistainvest.com.br/webhook/the_way_ia_free_mode",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          sessionId: finalSessionId,
          userName,
          userId,
          userEmail
        })
      }
    );

    const rawText = await flowResp.text();
    let data;
    try {
      data = JSON.parse(rawText); // tenta interpretar como JSON
    } catch (err) {
      console.error("[DEBUG] Resposta não é JSON. Pode ser HTML de erro.\n", rawText);
      data = { reply: rawText }; // se não for JSON, tratamos como texto
    }

    let reply = data.reply || "Erro: sem resposta.";
    // Substituições
    reply = reply.replace("{data_atual}", new Date().toLocaleString("pt-BR"));
    reply = reply.replace(/\bundefined\b/g, "");

    // Logar no console
    console.log("[DEBUG] JSON enviado ao n8n (thewayiaav):", JSON.stringify({
      userMessage: message,
      sessionId: finalSessionId,
      userName,
      userId,
      userEmail
    }, null, 2));

    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao chamar Flow (thewayiaav):", err);
    return res.status(500).json({ error: "Falha ao chamar Flow" });
  }
});

// Rota /api/sendEmail (exemplo)
app.post("/api/sendEmail", async (req, res) => {
  const { sessionId } = parseBody(req.body);
  const finalSessionId = sessionId || uuidv4();

  try {
    const flowResp = await fetch(
      "https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: "Receber o planejamento por e-mail",
          sessionId: finalSessionId
        })
      }
    );

    const rawText = await flowResp.text();
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (err) {
      console.error("[DEBUG] Resposta não é JSON. Pode ser HTML de erro.\n", rawText);
      data = { reply: rawText };
    }

    let reply = data.reply || "Erro: sem resposta.";
    reply = reply.replace("{data_atual}", new Date().toLocaleString("pt-BR"));
    reply = reply.replace(/\bundefined\b/g, "");

    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao enviar e-mail:", err);
    return res.status(500).json({ error: "Falha ao enviar e-mail" });
  }
});

// Configura timeout do servidor para 40% maior
const server = app.listen(4000, () => {
  console.log("API rodando na porta 4000");
  console.log("Timeout configurado para 168000ms (2.8 minutos)");
});

// Configura timeout do servidor (40% maior que o padrão)
server.timeout = 168000; // 120000 * 1.4 = 168000ms
