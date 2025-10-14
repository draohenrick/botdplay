const express = require('express');
const http = require('http');
const { Server } = require("socket.io"); // Para comunicação em tempo real
const cors = require('cors');
const bodyParser = require('body-parser');

const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const BotInstance = require('./BotInstance'); // <-- IMPORTA O MOTOR DO BOT

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());

// --- GERENCIADOR DE BOTS ATIVOS ---
const activeInstances = new Map();

// --- LÓGICA DO SOCKET.IO ---
io.on('connection', (socket) => {
    console.log('Um usuário se conectou ao socket:', socket.id);
    
    // O frontend deve enviar o token de autenticação para se juntar a uma "sala" privada
    const token = socket.handshake.auth.token;
    if (token) {
        // A "sala" terá o nome do ID do usuário, garantindo que ele só receba suas próprias notificações
        socket.join(token.id);
    }

    socket.on('disconnect', () => {
        console.log('Usuário desconectou do socket:', socket.id);
    });
});


// --- ROTAS PÚBLICAS ---
app.use('/api/auth', authRoutes);

// --- PROTEÇÃO ---
app.use(authMiddleware);

// --- ROTAS PROTEGIDAS (GERENCIAMENTO DO BOT) ---

// Rota para LISTAR as instâncias do usuário logado
app.get('/api/instances', async (req, res) => {
    try {
        // Usa a função do db.js para buscar apenas as instâncias que pertencem a este usuário
        const instances = await db.getInstancesByOwner(req.user.id);
        res.json(instances);
    } catch (error) {
        console.error("Erro ao buscar instâncias:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para CRIAR e CONECTAR uma nova instância de bot
app.post('/api/instances/connect', async (req, res) => {
    const { instanceName } = req.body;
    const ownerId = req.user.id; // ID do usuário logado

    if (!instanceName) {
        return res.status(400).json({ error: "O nome da instância é obrigatório." });
    }

    try {
        // Salva a nova instância no banco de dados
        const newInstanceData = {
            name: instanceName,
            ownerId: ownerId,
            status: 'pending'
        };
        const newInstance = await db.addInstance(newInstanceData);
        const instanceId = newInstance.insertedId.toString();

        // Inicia a instância do bot
        if (activeInstances.has(instanceId)) {
            return res.status(409).json({ error: "Instância já está ativa." });
        }

        const bot = new BotInstance({ id: instanceId, ownerId, name: instanceName }, io);
        activeInstances.set(instanceId, bot);

        bot.initialize().catch(err => {
            console.error(`[Servidor] Falha ao inicializar a instância ${instanceId}:`, err);
            activeInstances.delete(instanceId);
            db.updateInstance(instanceId, { status: 'error' });
        });

        res.status(201).json({ message: "Instância criada. Aguardando QR Code...", instanceId: instanceId });
        
    } catch (error) {
        console.error("Erro ao criar instância:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// Rota para DESCONECTAR uma instância
app.post('/api/instances/:id/disconnect', async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    try {
        const instance = await db.getInstanceById(id);
        if (!instance || instance.ownerId !== ownerId) {
            return res.status(404).json({ error: "Instância não encontrada ou não pertence a você." });
        }

        if (activeInstances.has(id)) {
            const bot = activeInstances.get(id);
            await bot.stop();
            activeInstances.delete(id);
        }

        await db.updateInstance(id, { status: 'offline' });
        res.json({ message: "Instância desconectada com sucesso." });
    } catch(error) {
        console.error("Erro ao desconectar instância:", error);
        res.status(500).json({ error: "Erro interno do servidor." });
    }
});

// (Outras rotas como /api/leads, /api/account, etc. podem ser adicionadas aqui)


// --- INICIALIZAÇÃO DO SERVIDOR ---
const startServer = async () => {
    try {
        await db.connectToDatabase();
        server.listen(PORT, () => {
            console.log(`🚀 Servidor rodando na porta ${PORT}`);
            // (Opcional) Aqui podemos adicionar a lógica para reiniciar os bots que estavam 'online'
        });
    } catch (error) {
        console.error("❌ Falha crítica ao iniciar o servidor:", error);
        process.exit(1);
    }
};

startServer();
