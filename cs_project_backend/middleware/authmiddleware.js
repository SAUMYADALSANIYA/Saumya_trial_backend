import JWT from 'jsonwebtoken';

export function verifyToken(req,res,next){
    const header = req.headers.authorization;
    if(!header){
        return res.status(401).json({message: "Auth header missing"});
    }
    const token = header;
    try{
        const payload = JWT.verify(token, process.env.JWT_SECRET);
        req.user = payload;
        next();
    }
    catch(error){
        console.log(error);
        res.status(500).send({
            success:false,
            message: "Invalid or expired token",
            error,
        });
    }
}

export  function permitRoles(...allowed){
    return(req,res,next)=>{
        if(!allowed.includes(req.user.role)){
            return res.status(403).json({message: "Insufficent permissions"});

        }
        next();
    };
}