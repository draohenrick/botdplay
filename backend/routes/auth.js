const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const SECRET = process.env.JWT_SECRET || 'dplaysecret';

// Banco simulado
const usuarios = [
  {
    id: 1,
    nome: 'Drão Henrick',
    email: 'admin@dplay.com',
    empresa: 'Dplay Bot',
    senha: bcrypt.hashSync('123456', 10),
    role: 'admin',
    whatsapp: '+55 11 99999-9999',
    codigo: 'ADM-0001',
    bots: [
      { id: 1, name: 'Bot Atendimento', status: 'Online' },
      { id: 2, name: 'Bot Vendas', status: 'Offline' }
    ],
    leads: 54
  }
];

// Registro
router.post('/register', async (req, res) => {
  const { nome, email, telefone, senha, empresa, segmento, descricao, endereco, horario } = req.body;

  if (!nome || !email || !senha) {
    return res.status(400).json({ error: 'Nome, email e senha são obrigatórios.' });
  }

  const existingUser = usuarios.find(u => u.email === email);
  if (existingUser) return res.status(409).json({ error: 'Usuário já existe.' });

  const hashedPassword = await bcrypt.hash(senha, 10);

  const newUser = {
    id: usuarios.length + 1,
    nome,
    email,
    telefone,
    senha: hashedPassword,
    empresa,
    segmento,
    descricao,
    endereco,
    horario,
    role: 'user',
    bots: [],
    leads: 0
  };

  usuarios.push(newUser);

  res.status(201).json({ success: true, message: 'Conta criada com sucesso!' });
});

// Login
router.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  if (!email || !senha) return res.status(400).json({ error: 'Email e senha são obrigatórios.' });

  const user = usuarios.find(u => u.email === email);
  if (!user) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

  const validPassword = await bcrypt.compare(senha, user.senha);
  if (!validPassword) return res.status(401).json({ error: 'Usuário ou senha inválidos.' });

  const token = jwt.sign({ email: user.email, role: user.role }, SECRET, { expiresIn: '2h' });

  res.json({ token, role: user.role });
});

module.exports = router;
module.exports.usuarios = usuarios; // exporta para account.js
