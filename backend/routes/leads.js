const express = require('express');
const router = express.Router();
const Lead = require('../models/Lead');
const { authUser } = require('../middleware/auth');

// Listar leads
router.get('/', authUser, async (req,res)=>{
    const leads = await Lead.find().sort({createdAt:-1});
    res.json({success:true, leads});
});

// Criar lead
router.post('/', authUser, async (req,res)=>{
    const lead = new Lead(req.body);
    await lead.save();
    res.json({success:true, lead});
});

module.exports = router;
