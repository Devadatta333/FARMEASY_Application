import mongoose from "mongoose"

const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true,
        unique:true
    },
    password:{
        type:String,
        required:true,
    },
    role:{
        type:String,
        required:true,
        enum:["admin","user","farmer"]
    },
    },
    {
     timestamps:true,
        });


export default mongoose.model("user", userSchema)