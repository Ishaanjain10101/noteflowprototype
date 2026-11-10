const fs = require("fs").promises;
const path = require("path");
const transporter = require("../middlewares/smtp");

function escapeHtml(value) {
    return String(value || "there").replace(/[&<>"']/g, character => ({
        "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
    })[character]);
}

async function sendPasswordChangedEmail(user) {
    try {
        const changedAt = new Date().toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" }) + " UTC";
        const html = (await fs.readFile(path.join(__dirname, "../templates/passwordChanged.html"), "utf8"))
            .replaceAll("{NAME}", escapeHtml(user.name))
            .replaceAll("{CHANGED_AT}", escapeHtml(changedAt));
        await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: user.email,
            subject: "Your NoteFlow password was changed",
            html,
            text: `Hi ${user.name || "there"}, your NoteFlow password was changed on ${changedAt}. If you made this change, no action is needed. If you did not, reset your password immediately and contact NoteFlow support.`
        });
        return true;
    } catch (error) {
        console.error("Password change notification email failed:", error);
        return false;
    }
}

module.exports = sendPasswordChangedEmail;
