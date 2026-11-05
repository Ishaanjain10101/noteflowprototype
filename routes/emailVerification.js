const express = require("express");
const router = express.Router();
const fs = require("fs").promises;
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const verificationCodeModel = require("../models/verification");
const secret = process.env.JWT_SECRET;
const path = require("path");
const getVerify = require("../controllers/verify-get");
const verifyPost = require("../controllers/verify-post");
const emailVerificationSendCode = require("../controllers/verifyEmail-post");

router.get("/verify",getVerify);
router.post("/verify/sendEmail",emailVerificationSendCode)
router.post("/verify",verifyPost);

module.exports = router;
