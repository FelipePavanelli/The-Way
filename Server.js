require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const { FINANCIAL_PLANNING_PROMPT } = require('./src/prompts/financial-planning');

const app = express();
const port = process.env.PORT || 4000;

if (!process.env.OPENAI_API_KEY) {
    console.error('Error: OPENAI_API_KEY is not set in environment variables');
    process.exit(1);
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Armazenamento em memória das configurações do sistema
let systemSettings = {
    systemPrompt: FINANCIAL_PLANNING_PROMPT,
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4000,
    knowledgeBase: [],
    updatedAt: new Date().toISOString()
};

// Endpoint para fornecer o prompt ao frontend
app.get('/api/prompt', (req, res) => {
    res.json({ prompt: FINANCIAL_PLANNING_PROMPT });
});

// Endpoint para obter configurações
app.get("/api/settings", (req, res) => {
    console.log('Configurações solicitadas');
    return res.json(systemSettings);
});

// Endpoint para salvar configurações
app.post("/api/settings", (req, res) => {
    try {
        const {
            systemPrompt,
            model,
            temperature,
            maxTokens,
            knowledgeBase,
            updatedBy
        } = req.body;

        systemSettings = {
            systemPrompt: systemPrompt || systemSettings.systemPrompt,
            model: model || systemSettings.model,
            temperature: temperature !== undefined ? temperature : systemSettings.temperature,
            maxTokens: maxTokens || systemSettings.maxTokens,
            knowledgeBase: knowledgeBase || systemSettings.knowledgeBase,
            updatedBy: updatedBy || 'system',
            updatedAt: new Date().toISOString()
        };

        console.log('Configurações atualizadas:', {
            model: systemSettings.model,
            temperature: systemSettings.temperature,
            maxTokens: systemSettings.maxTokens,
            updatedBy
        });
        
        return res.json({ 
            message: "Configurações salvas com sucesso",
            settings: systemSettings 
        });
    } catch (error) {
        console.error('Erro ao salvar configurações:', error);
        return res.status(500).json({ error: "Erro interno do servidor" });
    }
});

// Endpoint de streaming real
app.post('/api/stream-chat', async (req, res) => {
    try {
        const { messages } = req.body;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Adiciona o prompt do sistema no início da conversa
        const fullMessages = [
            { role: 'system', content: systemSettings.systemPrompt },
            ...messages
        ];

        const completion = await openai.chat.completions.create({
            model: systemSettings.model,
            messages: fullMessages,
            stream: true,
            max_tokens: systemSettings.maxTokens,
            temperature: systemSettings.temperature,
        });

        for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content;
            if (content) {
                res.write(`data: ${content}\n\n`);
            }
        }
        res.write('data: [DONE]\n\n');
        res.end();
    } catch (error) {
        console.error('Error:', error);
        res.write(`data: [ERROR] ${error.message}\n\n`);
        res.end();
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});