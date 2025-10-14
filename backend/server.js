// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const usersRouter = require('./routes/users');

// Middleware
app.use(express.json());
app.use(cors({
  origin: 'https://chatbotdplay.netlify.app', // seu front-end
  credentials: true
}));

// Rotas
app.use('/users', usersRouter);

// Health check
app.get('/', (req, res) => res.send('API do Dplay Bot funcionando!'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
