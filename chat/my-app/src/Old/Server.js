import express from "express";
import cors from "cors";
import fetch from "node-fetch";

const app = express();
app.use(cors()); // Habilita CORS para todas as rotas
app.use(express.json());

app.post("/api/agent", async (req, res) => {
  const { message } = req.body;
  try {
    // Chama Flow
    const flowResp = await fetch("https://n8n.altavistainvest.com.br/webhook-test/27a5a92e-e71e-45c1-aecd-0c36d112b94c", {
    // const flowResp = await fetch("https://n8n.altavistainvest.com.br/webhook/27a5a92e-e71e-45c1-aecd-0c36d112b94c", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userMessage: message })
    });
    const data = await flowResp.json();
    // data.reply => texto do Agent
    return res.json({ reply: data.reply });
  } catch (err) {
    console.error("Erro ao chamar Flow:", err);
    return res.status(500).json({ error: "Falha ao chamar Flow" });
  }
});

app.listen(3001, () => console.log("API rodando na porta 3001"));
