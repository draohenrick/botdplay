// routes/users.js
const express = require('express');
const router = express.Router();

// Mock banco de dados em memória
let users = [];

// Listar usuários
router.get('/', (req, res) => {
    res.json({ message: 'Lista de usuários retornada com sucesso!', users });
});

// Registrar usuário
router.post('/register', (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) return res.status(400).json({ error: 'Nome e email são obrigatórios' });

    const exists = users.find(u => u.email === email);
    if (exists) return res.status(400).json({ error: 'Email já cadastrado' });

    const newUser = { id: users.length + 1, name, email };
    users.push(newUser);
    res.json({ message: 'Usuário registrado com sucesso!', user: newUser });
});

// Login
router.post('/login', (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email é obrigatório' });

    const user = users.find(u => u.email === email);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });

    res.json({ message: `Usuário ${email} logado com sucesso!`, user });
});

module.exports = router;
