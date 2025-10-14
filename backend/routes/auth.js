const express = require('express');
const bcrypt = require('bcryptjs'); // <-- A CORREÇÃO ESTÁ AQUI
const jwt = require('jsonwebtoken');
const db = require('../db');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// O resto do arquivo continua o mesmo...

router.post('/register', async (req, res) => {
    const { nome, email, password } = req.body;
    // ...
    const hashedPassword = await bcrypt.hash(password, 10);
    // ...
});

router.post('/login', async (req, res) => {
    // ...
    const isMatch = await bcrypt.compare(password, user.password);
    // ...
});

module.exports = router;
