const fs = require("fs").promises;
const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const verificationCodeModel = require("../models/verification");
const secret = process.env.JWT_SECRET;
const path = require("path");

async function emailVerificationSendCode(req,res){
    const veritoken = req.cookies.verify;
    if(!veritoken){
        return res.redirect("/");
    }  
    try{
        const decoded = jwt.verify(veritoken,secret);
        const tempData = await verificationCodeModel.findOne({_id:decoded.id},{verificationCode:true,name:true,email:true,password:true});
        let html = await fs.readFile(path.join(__dirname,"../templates/emailVerification.html") , "utf8");
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
}


module.exports = emailVerificationSendCode;