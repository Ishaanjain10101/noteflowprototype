const bcrypt = require("bcrypt");
const verificationCodeModel = require("../models/verification");
const jwt = require("jsonwebtoken");


async function sendEmailVerification(req,res) {
    try{
        const code = Math.floor(100000 + Math.random()*900000).toString();
        const password = await bcrypt.hash(req.password,10);
        const tempData = new verificationCodeModel({
            verificationCode:code,
            name : req.name,
            email : req.email,
            password : password,
        });
        await tempData.save();
        const id = tempData._id;
        const veritoken = jwt.sign({id:id},process.env.JWT_SECRET,{expiresIn:"10m"});
        res.cookie("verify",veritoken,{httpOnly:true,maxAge:60 * 1000 * 10 });
        res.status(200).json({msg : "send email now" , code:101});
    }
    catch(err){
        console.log("Shit i messed up in sending \n" ,err);
    }    
}


module.exports = sendEmailVerification;