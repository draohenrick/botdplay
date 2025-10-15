const express = require('express');
const router = express.Router();
const Service = require('../models/Service');
const { authUser } = require('../middleware/auth');

// Listar serviços
router.get('/', authUser, async (req,res)=>{
    const services = await Service.find().sort({createdAt:-1});
    res.json({success:true, services});
});

// Criar serviço
router.post('/', authUser, async (req,res)=>{
    const service = new Service(req.body);
    await service.save();
    res.json({success:true, service});
});

// Deletar serviço
router.delete('/:id', authUser, async (req,res)=>{
    await Service.findByIdAndDelete(req.params.id);
    res.json({success:true});
});

module.exports = router;
