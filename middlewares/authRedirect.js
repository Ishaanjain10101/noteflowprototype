function authR(req,res,next){
    if(req.signedIn){
        next();
    }
    else{
        res.redirect("/");
    }
}
module.exports = authR;