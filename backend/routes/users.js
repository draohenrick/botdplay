const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Arquivo JSON para simular banco de dados (pode trocar por MongoDB/MySQL depois)
const usersFile = path.join(__dirname, '../data/users.json');

// Middleware de autenticação (reutiliza auth.js)
const { authenticateToken } = require('./auth');

// Função para ler usuários do arquivo
function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile);
  return JSON.parse(data);
}

// Função para salvar usuários
function saveUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
}

// Listar todos os usuários (protegido)
router.get('/', authenticateToken, (req, res) => {
  const users = readUsers();
  res.json(users);
});

// Obter usuário por ID (protegido)
router.get('/:id', authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });
  res.json(user);
});

// Criar novo usuário
router.post('/', authenticateToken, (req, res) => {
  const users = readUsers();
  const { name, email, level } = req.body;

  if (!name || !email) {
    return res.status(400).json({ message: 'Nome e email são obrigatórios' });
  }

  const newUser = {
    id: users.length ? users[users.length - 1].id + 1 : 1,
    name,
    email,
    level: level || 'user',
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  res.status(201).json(newUser);
});

// Atualizar usuário
router.put('/:id', authenticateToken, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (!user) return res.status(404).json({ message: 'Usuário não encontrado' });

  const { name, email, level } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (level) user.level = level;

  saveUsers(users);
  res.json(user);
});

// Deletar usuário
router.delete('/:id', authenticateToken, (req, res) => {
  let users = readUsers();
  const userIndex = users.findIndex(u => u.id === parseInt(req.params.id));
  if (userIndex === -1) return res.status(404).json({ message: 'Usuário não encontrado' });

  const deletedUser = users.splice(userIndex, 1)[0];
  saveUsers(users);
  res.json({ message: 'Usuário deletado', user: deletedUser });
});

module.exports = router;
