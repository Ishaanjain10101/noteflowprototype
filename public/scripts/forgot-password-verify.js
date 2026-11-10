const codeInputs = [...document.querySelectorAll(".code-input")];
const verifyButton = document.getElementById("button-verify");
const verifyMessage = document.getElementById("verify-message");
const resendButton = document.getElementById("resend-code");

function distributeCode(startIndex, value) {
    const digits = value.replace(/\D/g, "").slice(0, codeInputs.length - startIndex);
    digits.split("").forEach((digit, offset) => { codeInputs[startIndex + offset].value = digit; });
    codeInputs[Math.min(startIndex + digits.length, codeInputs.length - 1)].focus();
}

codeInputs.forEach((field, index) => {
    field.addEventListener("input", () => {
        const digits = field.value.replace(/\D/g, "");
        if (digits.length > 1 || (index === 0 && digits.length === 6)) {
            codeInputs.forEach(input => { input.value = ""; });
            distributeCode(0, digits);
            return;
        }
        field.value = digits.slice(0, 1);
        if (field.value && index < codeInputs.length - 1) codeInputs[index + 1].focus();
    });
    field.addEventListener("paste", event => {
        const digits = (event.clipboardData?.getData("text") || "").replace(/\D/g, "");
        if (!digits) return;
        event.preventDefault();
        codeInputs.forEach(input => { input.value = ""; });
        distributeCode(0, digits);
    });
    field.addEventListener("keydown", event => {
        if (event.key === "Enter") {
            event.preventDefault(); verifyButton.click();
        } else if (event.key === "Backspace" && !field.value && index > 0) {
            event.preventDefault(); codeInputs[index - 1].value = ""; codeInputs[index - 1].focus();
        } else if (event.key.length === 1 && !/\d/.test(event.key) && !event.metaKey && !event.ctrlKey) {
            event.preventDefault();
        }
    });
});

verifyButton.addEventListener("click", async () => {
    const code = codeInputs.map(field => field.value).join("");
    verifyMessage.className = "recovery-message";
    if (!/^\d{6}$/.test(code)) {
        verifyMessage.textContent = "Enter all six digits to continue.";
        verifyMessage.classList.add("is-error");
        codeInputs.find(field => !field.value)?.focus();
        return;
    }
    verifyButton.disabled = true;
    verifyMessage.textContent = "Checking your code…";
    try {
        const response = await fetch("/forgot-password/verify", {
            method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code })
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "That code didn’t work. Request another and try again.");
        window.location.assign(data.next || "/reset-password");
    } catch (error) {
        verifyMessage.textContent = error.message || "Couldn’t connect. Check your connection and try again.";
        verifyMessage.classList.add("is-error");
        verifyButton.disabled = false;
        if (error.message?.includes("expired") || error.message?.includes("Too many")) {
            setTimeout(() => window.location.assign("/forgot-password?expired=1"), 900);
        }
    }
});

resendButton.addEventListener("click", async () => {
    resendButton.disabled = true;
    verifyMessage.className = "recovery-message";
    verifyMessage.textContent = "Sending a fresh code…";
    try {
        const response = await fetch("/forgot-password/resend", { method: "POST" });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.message || "Couldn’t resend the code.");
        codeInputs.forEach(field => { field.value = ""; });
        verifyMessage.textContent = data.message;
        verifyMessage.classList.add("is-success");
        codeInputs[0].focus();
    } catch (error) {
        verifyMessage.textContent = error.message || "Couldn’t connect. Try again.";
        verifyMessage.classList.add("is-error");
    } finally {
        resendButton.disabled = false;
    }
});
