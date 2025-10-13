const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = 'dplay_super_secret_key_12345';

router.post('/register', async (req, res) => {
    const { nome, nomeEstabelecimento, email, password } = req.body;
    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    const users = db.getUsers();
    if (users.find(u => u.email === email)) {
        return res.status(409).json({ error: 'Este e-mail já está em uso.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
        nome,
        nomeEstabelecimento: nomeEstabelecimento || '',
        email,
        password: hashedPassword,
        nivel: 'admin' // O primeiro usuário é sempre admin
    };
    db.addUser(newUser);
    res.status(201).json({ message: 'Usuário registrado com sucesso!' });
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = db.getUsers().find(u => u.email === email);

    if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        return res.status(401).json({ error: 'Senha inválida.' });
    }

    const token = jwt.sign(
        { id: user.id, email: user.email, nome: user.nome, nivel: user.nivel },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    res.json({ message: 'Login bem-sucedido!', token });
});

module.exports = router;
