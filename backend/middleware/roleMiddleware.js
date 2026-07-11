const authorisedRoles=(...roles)=>{
    return (req,res,next)=>{
        if(!roles.includes(req.user.role)){
            return res.status(403).json({message:"you are not authorised to access this resource"});
        }
        next();
    };

};

export default authorisedRoles;