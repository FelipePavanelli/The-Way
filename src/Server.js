// server.js
import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());

// 1) Remove app.use(express.json()) e use express.raw() para receber qualquer coisa
app.use(express.raw({ type: "*/*", limit: "10mb" }));

// 2) Função auxiliar para extrair dados de um body do Auth0
function parseBody(rawBody) {
  if (!rawBody) {
    return {
      message: "",
      sessionId: null,
      userName: "",
      userId: "",
      userEmail: ""
    };
  }

  const bodyString = rawBody.toString("utf8");
  let parsed;
  try {
    parsed = JSON.parse(bodyString);
  } catch (err) {
    console.error("[DEBUG] Body não é JSON válido (ou é HTML):", err);
    parsed = {};
  }

  const {
    message = "",
    sessionId = null,
    userName = "",
    userId = "",
    userEmail = ""
  } = parsed;

  return { message, sessionId, userName, userId, userEmail };
}

// 3) Exemplo de rota GET
app.get("/", (req, res) => {
  res.send("API está rodando corretamente!");
});

// 4) Rota principal do agente
app.post("/api/agent", async (req, res) => {
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

          // (NOVO) Adicionando dados do usuário
          userName: userName,
          userId: userId,
          userEmail: userEmail
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
    reply = reply.replace("{data_atual}", new Date().toLocaleDateString("pt-BR"));
    reply = reply.replace(/\bundefined\b/g, "");

    // Logar no console o que foi enviado
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

// 5) Rota /api/sendEmail (exemplo)
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
    reply = reply.replace("{data_atual}", new Date().toLocaleDateString("pt-BR"));
    reply = reply.replace(/\bundefined\b/g, "");

    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao enviar e-mail:", err);
    return res.status(500).json({ error: "Falha ao enviar e-mail" });
  }
});

app.listen(4000, () => {
  console.log("API rodando na porta 4000");
});