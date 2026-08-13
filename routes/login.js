const express = require("express");
const router = express.Router();
const { loginUser } = require("../controllers/loginUser");

router.get("/login",(req,res)=>{
    res.render("login");
})

router.post("/login",loginUser);

module.exports = router;