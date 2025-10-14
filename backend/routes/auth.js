const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    const { nome, email, password } = req.body;

    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            nome,
            email,
            password: hashedPassword,
        };
        
        await db.addUser(newUser);
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        console.error("Erro detalhado no registro:", error); 
        res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    
    try {
        const user = await db.getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Senha inválida.' });
        }
        
        const userId = user._id.toString();
        const token = jwt.sign(
            { id: userId, email: user.email, nome: user.nome },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({ message: 'Login bem-sucedido!', token });

    } catch (error) {
        console.error("Erro no login:", error);
        res.status(500).json({ error: 'Erro interno ao fazer login.' });
    }
});

module.exports = router;
