const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const { randomInt } = require("crypto");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/usermodel");
const passwordVerificationModel = require("../models/passwordVerification");
const transporter = require("../middlewares/smtp");
const sendPasswordChangedEmail = require("../controllers/sendPasswordChangedEmail");

const router = express.Router();
const CODE_LIFETIME_MS = 10 * 60 * 1000;
const RESET_COOKIE = "passwordReset";
const VERIFY_COOKIE = "passwordResetVerify";

function setResetCookie(res, name, token) {
    res.cookie(name, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: CODE_LIFETIME_MS,
        path: "/"
    });
}

function clearResetCookies(res) {
    res.clearCookie(VERIFY_COOKIE, { path: "/" });
    res.clearCookie(RESET_COOKIE, { path: "/" });
}

function readResetToken(req, cookieName, expectedPurpose) {
    const token = req.cookies[cookieName];
    if (!token) return null;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded.purpose === expectedPurpose ? decoded : null;
    } catch {
        return null;
    }
}

router.get("/forgot-password", (req, res) => res.render("forgotPassword"));

router.post("/forgot-password", async (req, res) => {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ message: "Enter a valid email address." });
    }

    try {
        const recentRequest = await passwordVerificationModel.findOne({ email }).select("lastSentAt");
        if (recentRequest?.lastSentAt && Date.now() - recentRequest.lastSentAt.getTime() < 30_000) {
            return res.status(429).json({ message: "A code was just sent. Wait a moment before requesting another." });
        }
        const user = await userModel.findOne({ email }).select("_id name email");
        await passwordVerificationModel.deleteMany({ email });
        const code = String(randomInt(100000, 1000000));
        const verification = await passwordVerificationModel.create({
            email,
            userId: user?._id, 
            verificationCode: code,
            verificationExpires: new Date(Date.now() + CODE_LIFETIME_MS),
            verificationAttempts: 0, 
            verified: false, 
            lastSentAt: new Date()
        });
        const token = jwt.sign({ id: verification._id, purpose: "password-reset-verify" }, process.env.JWT_SECRET, { expiresIn: "10m" });
        setResetCookie(res, VERIFY_COOKIE, token);

        if (user) {
            const html = (await fs.readFile(path.join(__dirname, "../templates/passwordResetVerification.html"), "utf8"))
                .replaceAll("{CODE}", code)
                .replaceAll("{NAME}", String(user.name || "there").replace(/[<>&"']/g, ""));
            await transporter.sendMail({
                from: process.env.SMTP_USER, 
                to: user.email,
                subject: "Your NoteFlow password reset code", 
                html,
                text: `Your NoteFlow password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`
            });
        }
        return res.status(200).json({ message: "If an account uses that email, a verification code is on its way.", next: "/verify-forgot-password" });
    } catch (error) {
        console.error("Password reset request failed:", error);
        return res.status(500).json({ message: "We couldn’t send a reset code right now. Please try again." });
    }
});

router.get("/verify-forgot-password", async (req, res) => {
    const decoded = readResetToken(req, VERIFY_COOKIE, "password-reset-verify");
    if (!decoded) return res.redirect("/forgot-password");
    const verification = await passwordVerificationModel.findById(decoded.id).select("email verificationExpires");
    if (!verification || verification.verificationExpires <= new Date()) {
        clearResetCookies(res);
        return res.redirect("/forgot-password?expired=1");
    }
    const [local, domain] = verification.email.split("@");
    const emailHint = local.length < 3 ? `${local[0] || "•"}••@${domain}` : `${local.slice(0, 2)}•••@${domain}`;
    return res.render("emailVerifyForForgotPassword", { emailHint });
});

router.post("/forgot-password/verify", async (req, res) => {
    const decoded = readResetToken(req, VERIFY_COOKIE, "password-reset-verify");
    if (!decoded) return res.status(401).json({ message: "This reset code has expired. Request a new one." });
    const code = String(req.body.code || "").replace(/\D/g, "");
    if (!/^\d{6}$/.test(code)) return res.status(400).json({ message: "Enter all six digits." });

    try {
        const verification = await passwordVerificationModel.findById(decoded.id);
        if (!verification || verification.verificationExpires <= new Date()) {
            clearResetCookies(res);
            return res.status(410).json({ message: "This reset code has expired. Request a new one." });
        }
        if (verification.verified) return res.status(409).json({ message: "This code has already been used. Continue to set your password." });
        if (verification.verificationAttempts >= 5) {
            await verification.deleteOne();
            clearResetCookies(res);
            return res.status(429).json({ message: "Too many attempts. Request a new reset code." });
        }
        if (verification.verificationCode !== code) {
            await passwordVerificationModel.updateOne({ _id: verification._id }, { $inc: { verificationAttempts: 1 } });
            const attempts = verification.verificationAttempts + 1;
            if (attempts >= 5) {
                await verification.deleteOne();
                clearResetCookies(res);
                return res.status(429).json({ message: "Too many attempts. Request a new reset code." });
            }
            const remaining = 5 - attempts;
            return res.status(400).json({ message: `That code doesn’t match. ${remaining} attempt${remaining === 1 ? "" : "s"} left.` });
        }
        if (!verification.userId) {
            await verification.deleteOne();
            clearResetCookies(res);
            return res.status(400).json({ message: "We couldn’t verify that reset request. Check the email and try again." });
        }
        verification.verified = true;
        await verification.save();
        const token = jwt.sign({ id: verification._id, purpose: "password-reset" }, process.env.JWT_SECRET, { expiresIn: "10m" });
        setResetCookie(res, RESET_COOKIE, token);
        res.clearCookie(VERIFY_COOKIE, { path: "/" });
        return res.status(200).json({ next: "/reset-password" });
    } catch (error) {
        console.error("Password reset code verification failed:", error);
        return res.status(500).json({ message: "Couldn’t verify the code. Please try again." });
    }
});

router.post("/forgot-password/resend", async (req, res) => {
    const decoded = readResetToken(req, VERIFY_COOKIE, "password-reset-verify");
    if (!decoded) return res.status(401).json({ message: "This reset request expired. Start again." });
    try {
        const previous = await passwordVerificationModel.findById(decoded.id);
        if (!previous) return res.status(401).json({ message: "This reset request expired. Start again." });
        const waitMs = 30_000 - (Date.now() - (previous.lastSentAt?.getTime() || 0));
        if (waitMs > 0) return res.status(429).json({ message: `Wait ${Math.ceil(waitMs / 1000)} seconds before asking for another code.` });
        const user = previous.userId ? await userModel.findById(previous.userId).select("name email") : null;
        const code = String(randomInt(100000, 1000000));
        previous.verificationCode = code;
        previous.verificationExpires = new Date(Date.now() + CODE_LIFETIME_MS);
        previous.verificationAttempts = 0;
        previous.verified = false;
        previous.lastSentAt = new Date();
        await previous.save();
        const token = jwt.sign({ id: previous._id, purpose: "password-reset-verify" }, process.env.JWT_SECRET, { expiresIn: "10m" });
        setResetCookie(res, VERIFY_COOKIE, token);
        if (user) {
            const html = (await fs.readFile(path.join(__dirname, "../templates/passwordResetVerification.html"), "utf8"))
                .replaceAll("{CODE}", code)
                .replaceAll("{NAME}", String(user.name || "there").replace(/[<>&"']/g, ""));
            await transporter.sendMail({ from: process.env.SMTP_USER, to: user.email, subject: "Your NoteFlow password reset code", html, text: `Your NoteFlow password reset code is ${code}. It expires in 10 minutes.` });
        }
        return res.status(200).json({ message: "If an account uses that email, a new code is on its way." });
    } catch (error) {
        console.error("Password reset code resend failed:", error);
        return res.status(500).json({ message: "Couldn’t resend the code. Please try again." });
    }
});

router.get("/reset-password", async (req, res) => {
    const decoded = readResetToken(req, RESET_COOKIE, "password-reset");
    if (!decoded) return res.redirect("/forgot-password?expired=1");
    const verification = await passwordVerificationModel.findOne({ _id: decoded.id, verified: true }).select("verificationExpires");
    if (!verification || verification.verificationExpires <= new Date()) {
        clearResetCookies(res);
        return res.redirect("/forgot-password?expired=1");
    }
    return res.render("resetPassword");
});

router.post("/reset-password", async (req, res) => {
    const decoded = readResetToken(req, RESET_COOKIE, "password-reset");
    if (!decoded) return res.status(401).json({ message: "Your reset session expired. Request a new code." });
    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");
    if (!password.trim()) return res.status(400).json({ message: "Your password can’t be only spaces." });
    if (password.length < 8) return res.status(400).json({ message: "Use at least 8 characters for your new password." });
    if (password !== confirmPassword) return res.status(400).json({ message: "The passwords don’t match yet." });

    try {
        const verification = await passwordVerificationModel.findOne({ _id: decoded.id, verified: true });
        if (!verification || verification.verificationExpires <= new Date()) {
            clearResetCookies(res);
            return res.status(401).json({ message: "Your reset session expired. Request a new code." });
        }
        const user = await userModel.findById(verification.userId).select("name email");
        if (!user) return res.status(400).json({ message: "We couldn’t find that account. Request a new code." });
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
        await verification.deleteOne();
        clearResetCookies(res);
        const emailSent = await sendPasswordChangedEmail(user);
        return res.status(200).json({
            emailSent,
            message: emailSent
                ? "Your password has been updated. A confirmation email is on its way."
                : "Your password has been updated, but we couldn’t send the confirmation email right now."
        });
    } catch (error) {
        console.error("Password reset failed:", error);
        return res.status(500).json({ message: "Couldn’t update your password. Please try again." });
    }
});

module.exports = router;
