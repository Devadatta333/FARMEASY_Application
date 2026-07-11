import jwt from "jsonwebtoken";

const verifyToken=(req,res,next)=>{
    let token;
    let authHeader=req.headers.authorization || req.headers.Authorization

    if(authHeader && authHeader.startsWith("Bearer")){
        token=authHeader.split(" ")[1];
    

    if(!token){
        return res.status(401).json({message:"Not authorized, no token"});
    }

    try{
        const decode=jwt.verify(token,process.env.AuthSecret);
        req.user=decode;
        console.log(`the decoded user is ${req.user}`);
        next();

    }
    catch(error){
        res.status(401).json({message:"Token is not valid"});
    }
}
else{
     return res.status(401).json({message:"Not authorized, no token"});
}
}

export default verifyToken;