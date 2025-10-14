const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Rotas
const authRouter = require('./routes/auth');
const accountRouter = require('./routes/account');
const usersRouter = require('./routes/users');

app.use('/api/auth', authRouter);
app.use('/api/account', accountRouter);
app.use('/api/users', usersRouter);

// Endpoint raiz
app.get('/', (req, res) => {
  res.send('Backend Dplay Bot está rodando!');
});

// Catch-all para páginas estáticas (se houver frontend)
app.use(express.static(path.join(__dirname, 'public')));

// Error handler básico
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erro interno do servidor' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
