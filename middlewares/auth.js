const jwt = require("jsonwebtoken");

function auth(req,res,next){
    const token = req.cookies.token;
    let signedIn = false;
    try{
        const decoded = jwt.verify(token , process.env.JWT_SECRET);
        req.signedIn = true;
        req.userId = decoded.userId;
        next();
    }
    catch{
        req.signedIn = false;
        next();
    }
}

module.exports = {
    auth,
}