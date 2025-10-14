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

// --- ROTAS ---
app.use('/api/auth', authRoutes); // Rotas públicas (login/registro)

app.use(authMiddleware); // IMPORTANTE: Tudo abaixo desta linha é protegido e exige login

// Rota de exemplo protegida para o dashboard testar
app.get('/api/data', async (req, res) => {
    // Graças ao authMiddleware, temos acesso a req.user com os dados do token
    res.json({
        message: `Bem-vindo, ${req.user.nome}!`,
        userId: req.user.id,
        userEmail: req.user.email,
        data: [
            { id: 1, info: "Esta é uma informação protegida." },
            { id: 2, info: "Apenas usuários logados podem ver isso." }
        ]
    });
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
