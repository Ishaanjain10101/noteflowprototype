const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const verificationCodeModel = require("../models/verification");
const secret = process.env.JWT_SECRET;

async function verifyPost(req,res){
    const veritoken = req.cookies.verify;
    if(!veritoken){
        return res.redirect("/");
    }  
    try{
        const decoded = jwt.verify(veritoken,secret);
        const tempData = await verificationCodeModel.findOne({_id:decoded.id},{verificationCode:true,name:true,email:true,password:true,verificationAttempts:true});
        if(tempData.verificationCode === req.body.code){
            const user = new userModel({
                email:tempData.email,
                password:tempData.password,
                name:tempData.name
            });
            await user.save();
            await verificationCodeModel.deleteOne({verificationCode:req.body.code,email:tempData.email});
            res.clearCookie("verify");
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
        else{
            if(tempData.verificationAttempts < 5){
                await verificationCodeModel.updateOne({_id:decoded.id},{$inc:{verificationAttempts:1}});
                res.status(400).json();
            }
            else if(tempData.verificationAttempts >= 5){
                await verificationCodeModel.deleteOne({verificationCode:tempData.verificationCode,email:tempData.email});   
                res.clearCookie("verify");
                res.status(429).json();
            }
        }
    }
    catch{
        return res.redirect("/");
    }
}

module.exports = verifyPost;