// routes/users.js
const express = require('express');
const router = express.Router();

// Controladores simulados
// Se você tiver controllers separados, substitua essas funções pelos imports corretos
const getUsers = (req, res) => {
    res.json({ message: 'Lista de usuários retornada com sucesso!' });
};

const registerUser = (req, res) => {
    const { name, email } = req.body;
    if (!name || !email) {
        return res.status(400).json({ error: 'Nome e email são obrigatórios' });
    }
    // Aqui você adicionaria a lógica de salvar no banco
    res.json({ message: 'Usuário registrado com sucesso!', user: { name, email } });
};

const loginUser = (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' });
    }
    // Aqui você adicionaria validação real de login
    res.json({ message: `Usuário ${email} logado com sucesso!` });
};

// Rotas
router.get('/', getUsers); // Lista usuários
router.post('/register', registerUser); // Registro
router.post('/login', loginUser); // Login

// Exporta o router
module.exports = router;
