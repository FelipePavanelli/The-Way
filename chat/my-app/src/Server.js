import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import { v4 as uuidv4 } from "uuid";

const app = express();
app.use(cors());
app.use(express.json());

// Exemplo de rota /api/agent que chama n8n e faz substituições no texto
app.post("/api/agent", async (req, res) => {
  const { message, sessionId } = req.body;

  // Se não vier sessionId do front, geramos um novo
  let finalSessionId = sessionId || uuidv4();
  // console.log("[DEBUG] Usando sessionId:", finalSessionId);
  // console.log("[DEBUG] Mensagem do usuário:", message);

  try {
    // Faz POST ao webhook do n8n
    // const flowResp = await fetch("https://n8n.altavistainvest.com.br/webhook-test/27a5a92e-e71e-45c1-aecd-0c36d112b94c", {
    const flowResp = await fetch("https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userMessage: message,
        sessionId: finalSessionId
      })
    });

    const data = await flowResp.json();
    // console.log("[DEBUG] Resposta do n8n:", data);

    // Caso não tenha "data.reply", define um fallback
    let reply = data.reply || "Erro: sem resposta.";

    // 1) Substitui {data_atual} pela data local em formato dd/mm/aaaa
    reply = reply.replace("{data_atual}", new Date().toLocaleDateString("pt-BR"));

    // 2) Remove a palavra "undefined" se estiver sozinha (não afeta "Olá")
    reply = reply.replace(/\bundefined\b/g, "");

    // Retorna ao front a resposta e o sessionId
    return res.json({ reply, sessionId: finalSessionId });
  } catch (err) {
    console.error("[DEBUG] Erro ao chamar Flow:", err);
    return res.status(500).json({ error: "Falha ao chamar Flow" });
  }
});

app.listen(3001, () => {
  console.log("API rodando na porta 3001");
});
