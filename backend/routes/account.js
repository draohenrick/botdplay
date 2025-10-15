const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authUser } = require('../middleware/auth');

// Obter dados do usuário
router.get('/', authUser, (req, res) => {
    res.json({success:true, user:req.user});
});

// Atualizar perfil
router.put('/', authUser, async (req, res) => {
    const { name } = req.body;
    req.user.name = name || req.user.name;
    await req.user.save();
    res.json({success:true, user:req.user});
});

// Alterar senha
router.put('/password', authUser, async (req,res) => {
    const { currentPassword, newPassword } = req.body;
    const match = await bcrypt.compare(currentPassword, req.user.password);
    if(!match) return res.status(400).json({success:false,message:'Senha atual incorreta'});
    req.user.password = await bcrypt.hash(newPassword,10);
    await req.user.save();
    res.json({success:true,message:'Senha atualizada com sucesso'});
});

module.exports = router;
