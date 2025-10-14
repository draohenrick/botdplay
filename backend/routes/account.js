const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dplaysecret';
const usuarios = require('./auth').usuarios;

// Middleware de autenticação
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Token ausente.' });

  jwt.verify(token, SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.user = user;
    next();
  });
}

// GET /api/account
router.get('/', authenticateToken, (req, res) => {
  const userEmail = req.user.email;
  const user = usuarios.find(u => u.email === userEmail);
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado.' });

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

// PUT /api/account
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
