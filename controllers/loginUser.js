const userModel = require("../models/usermodel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const secret = process.env.JWT_SECRET;

async function loginUser(req,res){
    const body = req.body;
    if(!body || !body.email || !body.password){
        return res.status(400).json({error:"Invalid Data"})
    }
    const user = await userModel.findOne({"email":body.email});
    if(!user){
        return res.status(404).json({error:"User Doesn't Exsit"});
    }
    if (!await bcrypt.compare(body.password,user.password)){
        return res.status(400).json({error:"Incorrect Password"})
    }
    const token = jwt.sign({
        userId: user._id
    },secret,{
        expiresIn:"1d"
    });

    res.cookie("token",token,{
        httpOnly:true,
        maxAge: 1000 * 60 * 60 * 24,
        sameSite: "lax"
    });

    return res.status(200).json({msg:"Done"});
}

module.exports = {
    loginUser
}