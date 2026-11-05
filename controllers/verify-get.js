const jwt = require("jsonwebtoken");

async function getVerify(req,res){
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
}

module.exports = getVerify;