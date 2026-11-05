const express = require("express");
const router = express.Router();

router.get("/forgot-password",(req,res)=>{
    res.render("forgotPassword");
});

router.post("/forget-password",(req,res)=>{
    const body = req.body;
})


module.exports = router;