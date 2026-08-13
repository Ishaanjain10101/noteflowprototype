const express = require("express");
const router = express.Router();
const {auth} = require("../middlewares/auth");
const authR = require("../middlewares/authRedirect");

router.post("/logout",auth,authR,(req,res)=>{
    res.clearCookie("token");
    res.status(200).json();
});

module.exports = router;