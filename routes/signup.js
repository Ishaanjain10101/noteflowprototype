const express = require("express");
const signupUser = require("../controllers/signupUser");
const sendEmailVerification = require("../controllers/emailVerification");
const router = express.Router();

router.get("/signup",(req,res)=>{
    res.render("signup");
});

router.post("/signup",signupUser,sendEmailVerification);

module.exports = router;