const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.authUser = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if(!token) return res.status(401).json({success:false, message:'Token não fornecido'});

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);
        if(!req.user) return res.status(401).json({success:false, message:'Usuário não encontrado'});
        next();
    } catch(err){
        res.status(401).json({success:false, message:'Token inválido'});
    }
};

exports.authAdmin = (req, res, next) => {
    if(req.user?.admin) next();
    else res.status(403).json({success:false, message:'Acesso negado'});
};
