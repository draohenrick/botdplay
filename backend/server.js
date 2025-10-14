const express = require('express');
const http = require('http');
const cors = require('cors'); // <-- 1. GARANTA QUE ESTA LINHA EXISTE
const bodyParser = require('body-parser');

const db = require('./db');
const authMiddleware = require('./middleware/authMiddleware');
const authRoutes = require('./routes/auth');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 3001;

app.use(cors()); // <-- 2. GARANTA QUE ESTA LINHA EXISTE E VEM ANTES DAS ROTAS
app.use(bodyParser.json());

// --- ROTAS ---
app.use('/api/auth', authRoutes);

app.use(authMiddleware);

// --- ROTAS PROTEGIDAS ---
// (Suas outras rotas protegidas virão aqui)
app.get('/api/dashboard-data', (req, res) => {
    res.json({ message: `Bem-vindo, ${req.user.nome}!` });
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
