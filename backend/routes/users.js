const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const User = require('../models/User');
const { authUser, authAdmin } = require('../middleware/auth');

// Listar usuários
router.get('/', authUser, authAdmin, async (req,res)=>{
    const users = await User.find();
    res.json({success:true, users});
});

// Criar usuário
router.post('/', authUser, authAdmin, async (req,res)=>{
    const { name,email,password,admin } = req.body;
    const hashed = await bcrypt.hash(password,10);
    const user = new User({name,email,password:hashed,admin});
    await user.save();
    res.json({success:true,user});
});

// Deletar usuário
router.delete('/:id', authUser, authAdmin, async (req,res)=>{
    await User.findByIdAndDelete(req.params.id);
    res.json({success:true});
});

module.exports = router;
