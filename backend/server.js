const express = require('express');
const http = require('http');
const cors = require('cors');
const bodyParser = require('body-parser');

// Módulos locais
const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services'); // <-- Rota para os serviços

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

// Middlewares globais
app.use(cors());
app.use(bodyParser.json());


// --- ROTAS PÚBLICAS ---
// O usuário não precisa de login para acessar estas rotas
app.use('/api/auth', authRoutes);


// --- PROTEÇÃO ---
// Tudo o que for definido abaixo desta linha, exigirá um token de autenticação válido
app.use(authMiddleware);


// --- ROTAS PROTEGIDAS ---

// Rota para a página de "Configurar Bot" (services.html)
app.use('/api/services', serviceRoutes);

// Rota para a página principal (index.html/dashboard.html)
app.get('/api/dashboard-data', async (req, res) => {
    res.json({
        message: `Bem-vindo ao seu painel, ${req.user.nome}!`,
        // Futuramente, estes dados virão do banco de dados
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

// Rotas de exemplo para as outras páginas (retornam dados vazios por enquanto)
app.get('/api/instances', async (req, res) => { res.json([]); });
app.get('/api/leads', async (req, res) => { res.json([]); });
app.get('/api/conversations', async (req, res) => { res.json([]); });
app.get('/api/users', async (req, res) => { res.json([]); });


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
