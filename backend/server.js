const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

// --- Nossos Módulos ---
const db = require('./db'); // Módulo de banco de dados
const BotInstance = require('./BotInstance'); // Módulo de instâncias do Bot
const authMiddleware = require('./middleware/authMiddleware'); // Middleware de autenticação
const authRoutes = require('./routes/auth'); // Arquivo de rotas para login/registro

// --- Configuração Inicial ---
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Permite acesso de qualquer origem
        methods: ["GET", "POST", "PUT", "DELETE"]
    }
});

const PORT = process.env.PORT || 3001;

// --- Middlewares Globais ---
app.use(cors());
app.use(bodyParser.json());

// --- Configuração de Pastas (Uploads e Sessões) ---
// ATENÇÃO: Lembre-se que no Render gratuito, esta pasta será apagada em cada deploy.
// Para persistir, use o "Disk" do Render (plano pago).
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

// --- Gerenciamento de Instâncias Ativas ---
const activeInstances = new Map();

// (Aqui entrariam suas funções startBotInstance e stopBotInstance)


// --- DEFINIÇÃO DE ROTAS ---

// Rotas públicas (não precisam de login)
app.use('/api/auth', authRoutes); // IMPORTANTE: Define o prefixo para as rotas de autenticação (login, registro)

// A partir daqui, todas as rotas precisam de um token válido
app.use(authMiddleware);

// Rotas protegidas (precisam de login)
app.get('/api/instances', async (req, res) => {
    try {
        const allInstances = await db.getInstances();
        // Filtra para retornar apenas as instâncias do usuário logado
        res.json(allInstances.filter(i => i.ownerId === req.user.id));
    } catch (error) {
        console.error("Erro ao buscar instâncias:", error);
        res.status(500).json({ error: 'Erro ao buscar instâncias.' });
    }
});

// (Aqui entrariam suas outras rotas de API protegidas)


// --- INICIALIZAÇÃO DO SERVIDOR ---
const startServer = async () => {
    try {
        // IMPORTANTE: Conecta ao banco de dados ANTES de iniciar o servidor
        await db.connectToDatabase(); 
        
        server.listen(PORT, () => {
            console.log(`🚀 Servidor Dplay SaaS rodando na porta ${PORT}`);
        });
    } catch (error) {
        console.error("❌ Falha crítica ao iniciar o servidor:", error);
        process.exit(1);
    }
};

startServer();
