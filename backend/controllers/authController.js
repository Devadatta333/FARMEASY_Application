import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import user from "../models/userModel.js"


const registerUser= async (req,res)=>{
   try{
    
    console.log("Request received");
    console.log(req.body);

    const {username,password,role}=req.body;

    const finduser=await user.findOne({username});

    if(finduser){
        res.status(400).json({message:"This username is already taken, Please choose a different username"});
        return;
    }

    const hashedPassword=await bcrypt.hash(password,10);

    const newuser=new user({
        username,
        password:hashedPassword,
        role
    })

    await newuser.save();

    res.status(201).json({message:`user has sucessfully registered with username ${username}`});

}
catch(error){
    console.error(error);

    res.status(500).json({
        message: error.message
    });
}
};




const loginUser= async (req,res)=>{
    try{

        const {username,password}=req.body;


        const finduser=await user.findOne({username});

        if(!finduser){
            res.status(404).json({message:"user not found"});
            return;
        }

        const ispasswordcorrect=await bcrypt.compare(password,finduser.password);

        if(!ispasswordcorrect){
            res.status(401).json({message:"incorrect password"});
            return;
        }

        const token=jwt.sign({id:finduser._id,role:finduser.role},process.env.AuthSecret,
            {expiresIn:"1h"}
        );

        res.status(200).json({message:"login sucessful",token});

    }catch(error){
    console.error(error);

    res.status(500).json({
        message: error.message
    });
}

};


export {registerUser,loginUser};

