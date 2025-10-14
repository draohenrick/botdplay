const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const authRoutes = require('./auth');
const accountRoutes = require('./account');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Rotas
app.use('/', authRoutes);         // /register e /login
app.use('/api/account', accountRoutes); // GET e PUT /api/account

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
