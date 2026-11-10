const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/loginUser");

const rateLimit = require("express-rate-limit");

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes

    max: 5, // 5 attempts per IP

    standardHeaders: "draft-8",
    legacyHeaders: false,

    message: {
        success: false,
        message: "Too many login attempts. Try again later."
    }
});

router.get("/login",(req,res)=>{
    res.render("login");
})

router.post("/login",loginLimiter,loginUser);

module.exports = router;