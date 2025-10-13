const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const db = require('./db');
const BotInstance = require('./BotInstance');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;
app.use(cors());
app.use(bodyParser.json());

const DATA_DIR = process.env.NODE_ENV === 'production' ? '/data' : path.join(__dirname);
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOADS_DIR),
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static(UPLOADS_DIR));

const activeInstances = new Map();

function startBotInstance(instanceConfig) {
    if (activeInstances.has(instanceConfig.id)) return;
    const bot = new BotInstance(instanceConfig, io);
    bot.initialize().catch(err => {
        console.error(`[Servidor] Falha ao inicializar instância ${instanceConfig.id}:`, err);
        db.updateInstance(instanceConfig.id, { status: 'error' });
    });
    activeInstances.set(instanceConfig.id, bot);
}

async function stopBotInstance(instanceId) {
    if (activeInstances.has(instanceId)) {
        const bot = activeInstances.get(instanceId);
        if (bot && typeof bot.stop === 'function') await bot.stop();
        activeInstances.delete(instanceId);
        console.log(`[Servidor] Instância ${instanceId} parada.`);
    }
}

app.use('/api/auth', authRoutes);
app.use(authMiddleware);

// API de Instâncias
app.get('/api/instances', (req, res) => res.json(db.getInstances().filter(i => i.ownerId === req.user.id)));

// ... (restante das rotas, como nas respostas anteriores)

server.listen(PORT, () => {
    console.log(`🚀 Servidor Dplay SaaS rodando na porta ${PORT}`);
});
