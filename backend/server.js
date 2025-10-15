const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Módulos locais
const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');
const serviceRoutes = require('./routes/services');
const BotInstance = require('./BotInstance');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET;

// Middlewares globais
app.use(cors());
app.use(bodyParser.json());

const activeInstances = new Map();

// Lógica do Socket.IO para autenticação
io.on('connection', (socket) => {
    try {
        const token = socket.handshake.auth.token;
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded && decoded.id) {
            socket.join(decoded.id);
            console.log(`Socket ${socket.id} entrou na sala do usuário ${decoded.id}`);
        }
    } catch (error) {
        console.error("Falha na autenticação do socket:", error.message);
        socket.disconnect();
    }
});

// --- ROTAS PÚBLICAS ---
app.use('/api/auth', authRoutes);

// --- PROTEÇÃO ---
app.use(authMiddleware);

// --- ROTAS PROTEGIDAS ---
app.use('/api/services', serviceRoutes);

app.get('/api/instances', async (req, res) => {
    try {
        const instances = await db.getInstancesByOwner(req.user.id);
        res.json(instances);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar instâncias." });
    }
});

app.post('/api/instances/connect', async (req, res) => {
    const { instanceName } = req.body;
    const ownerId = req.user.id; 

    try {
        const newInstanceData = { name: instanceName, ownerId, status: 'pending' };
        const newInstance = await db.addInstance(newInstanceData);
        const instanceId = newInstance.insertedId.toString();

        if (activeInstances.has(instanceId)) { activeInstances.get(instanceId).stop(); }

        const bot = new BotInstance({ id: instanceId, ownerId, name: instanceName }, io);
        activeInstances.set(instanceId, bot);

        bot.initialize().catch(err => {
            console.error(`Falha ao inicializar instância ${instanceId}:`, err);
            activeInstances.delete(instanceId);
            db.updateInstance(instanceId, { status: 'error' });
        });
        res.status(201).json({ instanceId });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar instância." });
    }
});

app.post('/api/instances/:id/disconnect', async (req, res) => {
    const { id } = req.params;
    const ownerId = req.user.id;

    try {
        const instance = await db.getInstanceById(id);
        if (!instance || instance.ownerId !== ownerId) {
            return res.status(404).json({ error: "Instância não encontrada." });
        }

        if (activeInstances.has(id)) {
            await activeInstances.get(id).stop();
            activeInstances.delete(id);
        }

        await db.updateInstance(id, { status: 'offline' });
        res.json({ message: "Instância desconectada." });
    } catch(error) {
        res.status(500).json({ error: "Erro ao desconectar instância." });
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

