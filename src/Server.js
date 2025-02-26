import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

// Rota /teste - para verificar se a API está rodando
app.get("/", (req, res) => {
  res.send("API está rodando corretamente!");
});

// Rota /api/agent
app.post("/api/agent", async (req, res) => {
  const { message, sessionId } = req.body;
  let finalSessionId = sessionId || uuidv4();

  try {
    // Utilizando o webhook do n8n (produção)
    const flowResp = await fetch(
      "https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userMessage: message,
          sessionId: finalSessionId
        })
      }
    );

    const data = await flowResp.json();
    let reply = data.reply || "Erro: sem resposta.";

    // Substituições no reply
    reply = reply.replace(
      "{data_atual}",
      new Date().toLocaleDateString("pt-BR")
    );
    reply = reply.replace(/\bundefined\b/g, "");

    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao chamar Flow:", err);
    return res.status(500).json({ error: "Falha ao chamar Flow" });
  }
});

// Rota /api/sendEmail
app.post("/api/sendEmail", async (req, res) => {
  const { sessionId } = req.body;
  const finalSessionId = sessionId || uuidv4();

  try {
    // Utilizando o webhook do n8n (produção)
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

    const data = await flowResp.json();
    let reply = data.reply || "Erro: sem resposta.";

    // Substituições no reply
    reply = reply.replace(
      "{data_atual}",
      new Date().toLocaleDateString("pt-BR")
    );
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
