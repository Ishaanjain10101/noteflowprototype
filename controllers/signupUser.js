const userModel = require("../models/usermodel");

async function signupUser(req,res,next) {
    const body = req.body;
    if(!body || !body.name|| !body.email || !body.password){
        return res.status(400).json({error:"Please provide your name, email, and password."});
    }
    try{
        if(await userModel.findOne({email:body.email})){
            return res.status(400).json({msg: "alreadySignuped",code:1});
            
        }
        req.email = body.email;
        req.password = body.password;
        req.name = body.name;
        next();
    }catch(err){
        console.log(err);
        
    }
}

module.exports = signupUser;
