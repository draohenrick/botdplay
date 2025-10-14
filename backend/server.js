const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- ROTAS PÚBLICAS ---
app.use('/api/auth', authRoutes);

// --- PROTEÇÃO ---
// Tudo abaixo desta linha exige um token de autenticação válido
app.use(authMiddleware);

// --- ROTAS PROTEGIDAS ---

// Rota para a página principal (index.html/dashboard.html)
app.get('/api/dashboard-data', async (req, res) => {
    res.json({
        message: `Bem-vindo ao seu painel, ${req.user.nome}!`,
        bots: [
            { id: 1, name: "Bot Atendimento", status: "Online" },
            { id: 2, name: "Bot Vendas", status: "Offline" }
        ]
    });
});

// Rota para a página de conta (account.html)
app.get('/api/account', async (req, res) => {
    try {
        // O ID do usuário vem do token que o authMiddleware decodificou
        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }
        // Remove a senha antes de enviar os dados do usuário
        delete user.password;
        res.json(user);
    } catch (error) {
        console.error("Erro ao buscar dados da conta:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para a página de instâncias (instances.html)
app.get('/api/instances', async (req, res) => {
    try {
        const instances = await db.getInstances(req.user.id);
        res.json(instances);
    } catch (error) {
        console.error("Erro ao buscar instâncias:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para a página de leads (leads.html)
app.get('/api/leads', async (req, res) => {
    try {
        const leads = await db.getLeads(req.user.id);
        res.json(leads);
    } catch (error) {
        console.error("Erro ao buscar leads:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para a página de conversas (conversations.html)
app.get('/api/conversations', async (req, res) => {
    try {
        const conversations = await db.getConversations(req.user.id);
        res.json(conversations);
    } catch (error) {
        console.error("Erro ao buscar conversas:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para a página de serviços (services.html)
app.get('/api/services', async (req, res) => {
    try {
        const services = await db.getServices(req.user.id);
        res.json(services);
    } catch (error) {
        console.error("Erro ao buscar serviços:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para a página de usuários (usuarios.html)
app.get('/api/users', async (req, res) => {
    try {
        // Aqui você pode adicionar uma lógica para verificar se o req.user é um admin
        const users = await db.getUsersList();
        res.json(users);
    } catch (error) {
        console.error("Erro ao buscar lista de usuários:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});


// --- INICIALIZAÇÃO DO SERVIDOR ---
const startServer = async () => {
    try {
        await db.connectToDatabase();
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Falha crítica ao iniciar o servidor:", error);
        process.exit(1);
    }
};

startServer();
