const express = require('express');
const router = express.Router();
const { authUser, authAdmin } = require('../middleware/auth');
const User = require('../models/User');
const Lead = require('../models/Lead');
const Service = require('../models/Service');

// Dashboard admin
router.get('/dashboard', authUser, authAdmin, async (req,res)=>{
    const activeUsers = await User.countDocuments();
    const totalLeads = await Lead.countDocuments();
    const activeConnections = 10; // mock, ajuste real
    const botStatus = true;

    // Charts mock
    const charts = {
        users:{labels:['Jan','Feb','Mar'], values:[5,10,8]},
        connections:{labels:['Jan','Feb','Mar'], values:[2,5,7]}
    };

    // Logs mock
    const logs = ['Sistema iniciado','Novo lead registrado','Usuário admin logado'];

    res.json({success:true,kpis:{activeUsers,totalLeads,activeConnections,botStatus},charts,logs});
});

module.exports = router;
