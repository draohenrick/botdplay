const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// 🔹 Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token ausente.' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
}

// 🔹 Simulação de um banco de dados
// (Substitua depois por seu banco real)
const usuarios = [
  {
    id: 1,
    nome: 'Drão Henrick',
    email: 'admin@dplay.com',
    empresa: 'Dplay Bot',
    whatsapp: '+55 11 99999-9999',
    codigo: 'ADM-0001',
    role: 'admin',
    bots: [
      { id: 1, name: 'Bot Atendimento', status: 'Online' },
      { id: 2, name: 'Bot Vendas', status: 'Offline' }
    ],
    leads: 54
  },
  {
    id: 2,
    nome: 'Usuário Padrão',
    email: 'user@empresa.com',
    empresa: 'Empresa XYZ',
    whatsapp: '+55 21 98888-8888',
    codigo: 'USR-002',
    role: 'user',
    bots: [
      { id: 1, name: 'Bot Suporte', status: 'Online' }
    ],
    leads: 7
  }
];

// 🔹 GET /api/account — Retorna os dados do usuário autenticado
router.get('/', authenticateToken, (req, res) => {
  const userEmail = req.user.email;

  const user = usuarios.find(u => u.email === userEmail);
  if (!user) {
    return res.status(404).json({ message: 'Usuário não encontrado.' });
  }

  res.json({
    id: user.id,
    nome: user.nome,
    email: user.email,
    empresa: user.empresa,
    whatsapp: user.whatsapp,
    codigo: user.codigo,
    role: user.role,
    bots: user.bots,
    leads: user.leads
  });
});

// 🔹 PUT /api/account — Atualiza dados básicos (nome, empresa, whatsapp)
router.put('/', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const user = usuarios.find(u => u.email === userEmail);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

  const { nome, empresa, whatsapp } = req.body;

  if (nome) user.nome = nome;
  if (empresa) user.empresa = empresa;
  if (whatsapp) user.whatsapp = whatsapp;

  res.json({ message: 'Dados atualizados com sucesso.', user });
});

module.exports = router;
