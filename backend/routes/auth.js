const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;

router.post('/register', async (req, res) => {
    // 1. Pega os dados do corpo da requisição
    const { nome, nomeEstabelecimento, email, password } = req.body;

    // 2. Validação básica para garantir que os campos essenciais não são nulos ou vazios
    if (!nome || !email || !password) {
        return res.status(400).json({ error: 'Nome, e-mail e senha são obrigatórios.' });
    }

    try {
        const existingUser = await db.getUserByEmail(email);
        if (existingUser) {
            return res.status(409).json({ error: 'Este e-mail já está em uso.' });
        }

        // 3. Garante que a senha é uma string antes de fazer o hash
        if (typeof password !== 'string' || password.length === 0) {
            return res.status(400).json({ error: 'A senha fornecida é inválida.' });
        }
        
        const hashedPassword = await bcrypt.hash(password, 10);
        
        const newUser = {
            nome,
            nomeEstabelecimento: nomeEstabelecimento || '',
            email,
            password: hashedPassword,
            nivel: 'admin',
            createdAt: new Date() // Adiciona uma data de criação
        };
        
        await db.addUser(newUser);
        
        res.status(201).json({ message: 'Usuário registrado com sucesso!' });

    } catch (error) {
        // 4. Log aprimorado: Mostra o erro completo no console do Render
        console.error("Erro detalhado no registro:", error); 
        
        // Mensagem de erro genérica para o usuário final
        res.status(500).json({ error: 'Erro interno ao registrar usuário.' });
    }
});

// A sua rota de login continua aqui...
router.post('/login', async (req, res) => {
    // ... (código do login sem alterações)
});


module.exports = router;
