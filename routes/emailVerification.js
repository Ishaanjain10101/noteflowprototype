const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const verificationCodeModel = require("../models/verification");

const transpoter = nodemailer.createTransport({
    host:"smtp.gmail.com",
    port:587,
    secure:false,
    auth:{
        user:process.env.SMTP_USER,
        pass:process.env.SMTP_PASS
    }
});

(async function s(){
    try{
        await transpoter.verify();
    }catch(err){
        console.log(err)
    }
})();

router.get("/verify",async (req,res)=>{
    const veritoken = req.cookies.verify;
    if(!veritoken){
        return res.redirect("/");
    }
    try{
        const decoded = jwt.verify(veritoken,process.env.JWT_SECRET);
        res.render("emailVerify");
    }catch(err){
        console.log(err);
        return res.redirect("/");
    }
})
router.post("/verify/sendEmail",async (req,res)=>{
    const veritoken = req.cookies.verify;
    if(!veritoken){
        return res.redirect("/");
    }  
    try{
        const decoded = jwt.verify(veritoken,process.env.JWT_SECRET);
        const tempData = await verificationCodeModel.findOne({_id:decoded.id},{verificationCode:true,name:true,email:true,password:true});
        let html = await fs.readFile("./templates/emailVerification.html" , "utf8");
        html = html.replace("{CODE}",String(tempData.verificationCode));
        
        await transpoter.sendMail({
            from:process.env.SMTP_USER,
            subject:"Email Verification Code",
            to:tempData.email,
            html:html,
            text:"This is a test email just to see if it is working or not",
        }); 
    }catch(err){
        console.log(err);
        return res.redirect("/");
    }
})
router.post("/verify",async (req,res)=>{
    const veritoken = req.cookies.verify;
    if(!veritoken){
        return res.redirect("/");
    }  
    try{
        const decoded = jwt.verify(veritoken,process.env.JWT_SECRET);
        const tempData = await verificationCodeModel.findOne({_id:decoded.id},{verificationCode:true,name:true,email:true,password:true,verificationAttempts:true});
        if(tempData.verificationCode === req.body.code){
            const user = new userModel({
                email:tempData.email,
                password:tempData.password,
                name:tempData.name
            });
            await user.save();
            await verificationCodeModel.deleteOne({verificationCode:req.body.code,email:tempData.email,});
            res.clearCookie("verify");
            res.status(201).json();    
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

});

module.exports = router;