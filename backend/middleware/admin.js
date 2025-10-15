const admin = (req,res,next)=>{
    if(req.user.role !== 'admin') return res.status(403).json({success:false,message:'Acesso negado'});
    next();
};

module.exports = admin;
