const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const verificationCodeModel = require("../models/verification");
const secret = process.env.JWT_SECRET;
const path = require("path");

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

module.exports = transpoter;