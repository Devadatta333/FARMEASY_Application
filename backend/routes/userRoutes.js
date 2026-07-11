import express from "express"
import verifyToken from "../middleware/authMiddleware.js"
import authorisedRoles from "../middleware/roleMiddleware.js"


const router=express.Router();

//only admin can access this route
router.get("/admin", verifyToken, authorisedRoles("admin"), (req,res)=>{
    res.json({message:"Welcome admin"});
})

//both admin and farmer can access this route
router.get("/farmer", verifyToken, authorisedRoles("admin", "farmer"), (req,res)=>{
    res.json({message:"Welcome farmer"});
})

//all can access this route
router.get("/user", verifyToken, authorisedRoles("admin", "farmer", "user"), (req,res)=>{
    res.json({message:"Welcome user"});
})


export default router;