const express = require("express");
const bcrypt = require("bcrypt");
const auth = require("../middlewares/auth");
const userModel = require("../models/usermodel");
const passwordVerificationModel = require("../models/passwordVerification");
const sendPasswordChangedEmail = require("../controllers/sendPasswordChangedEmail");

const router = express.Router();

router.get("/change-password", auth, (req, res) => {
    if (!req.signedIn || !req.userId) return res.redirect("/login");
    return res.render("changePassword");
});

router.post("/change-password", auth, async (req, res) => {
    if (!req.signedIn || !req.userId) return res.status(401).json({ message: "Please log in to change your password." });
    const currentPassword = String(req.body.currentPassword || "");
    const newPassword = String(req.body.newPassword || "");
    const confirmPassword = String(req.body.confirmPassword || "");
    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).json({ message: "Fill in all three password fields." });
    }
    if (!newPassword.trim()) return res.status(400).json({ message: "Your password can’t be only spaces." });
    if (newPassword.length < 8) return res.status(400).json({ message: "Use at least 8 characters for your new password." });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "The new passwords don’t match yet." });

    try {
        const user = await userModel.findById(req.userId).select("name email password");
        if (!user) return res.status(401).json({ message: "Your account could not be found. Please log in again." });
        if (!await bcrypt.compare(currentPassword, user.password)) {
            return res.status(400).json({ message: "Your current password doesn’t match." });
        }
        if (await bcrypt.compare(newPassword, user.password)) {
            return res.status(400).json({ message: "Choose a password you haven’t used for this account." });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();
        try {
            await passwordVerificationModel.deleteMany({ email: user.email });
        } catch (cleanupError) {
            console.error("Could not clear old password reset codes:", cleanupError);
        }
        const emailSent = await sendPasswordChangedEmail(user);
        return res.status(200).json({
            emailSent,
            message: emailSent
                ? "Password changed. A confirmation email is on its way."
                : "Password changed, but we couldn’t send the confirmation email right now."
        });
    } catch (error) {
        console.error("Password change failed:", error);
        return res.status(500).json({ message: "Couldn’t change your password right now. Please try again." });
    }
});

module.exports = router;
